var State = require('ampersand-state');
var punycode = require('punycode');
var generateEvents = require('./diff');


module.exports = State.extend({
    initialize: function () {
        var self = this;
        
        self.buffer = [];
        self.queue = [];
    },
    props: {
        seq: 'number',
        buffer: 'array',
        queue: 'array',
        lastTime: 'number',
        lastReset: 'number',
        changedBetweenReset: 'boolean',
        resetInterval: ['number', true, 10000],
        replaySpeedScale: ['number', true, 1]
    },
    derived: {
        text: {
            deps: ['buffer'],
            fn: function () {
                return punycode.ucs2.encode(this.buffer.slice());
            }
        }
    },
    update: function (text) {
        var self = this;

        var events = [];
        if (text !== undefined) {
            if (text.normalize) {
                text = text.normalize('NFC');
            }

            var newBuffer = punycode.ucs2.decode(text);

            events = generateEvents(this.buffer, newBuffer.slice());

            this.buffer = newBuffer;
            this.trigger('change:buffer');
        }

        if (this.changedBetweenResets && Date.now() - this.lastReset > this.resetInterval) {
            this.queue = [];
            this.queue.push({
                type: 'insert',
                text:  this.text
            });
            this.isReset = true;
            this.lastTime = Date.now();
            this.lastReset = Date.now();
            this.changedBetweenResets = false;
        } else if (events.length) {
            var wait = Date.now() - (this.lastTime || Date.now());
            if (wait > 0) {
                this.queue.push({
                    type: 'wait',
                    num: wait * this.replaySpeedScale
                });
            }
            events.forEach(function (event) {
                self.queue.push(event);
            });
            this.lastTime = Date.now();
            this.changedBetweenResets = true;
        }
    },
    start: function () {
        this.isStarting = true;
        this.seq = Math.floor(Math.random() * 10000 + 1);
    },
    stop: function () {
        this.commit();
    },
    commit: function () {
        this.seq = 0;
        this.lastTime = 0;
        this.queue = [];
        this.buffer = [];
    },
    diff: function () {
        this.update();

        if (!this.queue.length) {
            return;
        }
            
        var event = {
            seq: this.seq++,
            actions: []
        };

        if (this.isStarting) {
            event.event = 'new';
            this.isStarting = false;
            this.lastReset = Date.now();
        } else if (this.isReset) {
            event.event = 'reset';
            this.isReset = false;
        }
        
        event.actions = this.queue;
        this.queue = [];

        return event;
    }
});
