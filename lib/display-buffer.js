var async = require('async');
var punycode = require('punycode');
var State = require('ampersand-state');


module.exports = State.extend({
    initialize: function () {
        var self = this;
        self.buffer = [];

        this.resetQueue();
   },
    props: {
        seq: 'number',
        buffer: 'array',
        cursor: 'number',
        synced: 'boolean'
    },
    derived: {
        text: {
            deps: ['buffer'],
            fn: function () {
                return punycode.ucs2.encode(this.buffer);
            }
        }
    },
    resetQueue: function () {
        var self = this;

        if (this.eventQueue) {
            this.eventQueue.kill();
        }

        this.seq = 0;
        this.synced = true;
        this.buffer = [];

        this.trigger('change:buffer');

        this.eventQueue = async.queue(function (event, cb) {
            var currTime = Date.now();

            if (event.type === 'insert') {
                self.insert(event.text, event.pos);
                return cb();
            } else if (event.type === 'erase') {
                self.erase(event.num, event.pos);
                return cb();
            } else if (event.type === 'wait') {
                if (event.num > 900) {
                    event.num = 900;
                }

                if (currTime - (event.baseTime + event.num) > 1000 || event.num < 25) {
                    return cb();
                } else {
                    setTimeout(function () {
                        cb();
                    }, event.num);
                }
            } else {
                return cb();
            }
        });
    },
    insert: function (text, pos) {
        text = text || '';

        if (pos === undefined) {
            pos = this.buffer.length;
        }

        if (text.normalize) {
            text = text.normalize('NFC');
        }

        var args = punycode.ucs2.decode(text);
        var textLen = args.length;

        args.unshift(0);
        args.unshift(pos);

        this.buffer.splice.apply(this.buffer, args);

        this.cursor = pos + textLen;

        this.trigger('change:buffer');
    },
    erase: function (num, pos) {
        if (pos === undefined) {
            pos = this.buffer.length;
        }
        if (num === undefined) {
            num = 1;
        }

        this.buffer.splice(pos - num, num);

        this.cursor = pos - num;

        this.trigger('change:buffer');
    },
    commit: function () {
        this.resetQueue();
    },
    process: function (event) {
        var self = this;

        if (event.event === 'reset' || event.event === 'new') {
            self.resetQueue();
            self.seq = event.seq;
        } else if (event.seq !== self.seq) {
            self.synced = false;
        }

        if (event.actions) {
            event.actions.forEach(function (action) {
                action.baseTime = Date.now();
                self.eventQueue.push(action);
            });
        }

        self.seq = self.seq + 1;
    }
});
