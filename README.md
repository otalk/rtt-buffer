# RTT-Buffer
**Input and display Realtime Text**

[![Build Status](https://travis-ci.org/legastero/rtt-buffer.png)](https://travis-ci.org/legastero/rtt-buffer)
[![Dependency Status](https://david-dm.org/legastero/rtt-buffer.png)](https://david-dm.org/legastero/rtt-buffer)
[![devDependency Status](https://david-dm.org/legastero/rtt-buffer/dev-status.png)](https://david-dm.org/legastero/rtt-buffer#info=devDependencies)

[![Browser Support](https://ci.testling.com/legastero/rtt-buffer.png)](https://ci.testling.com/legastero/rtt-buffer)

## What is this?

The `rtt-buffer` module provides a `DisplayBuffer` and `InputBuffer` for tracking the state of incoming or outgoing realtime text, and for generating the proper edit actions to send.

## What is Realtime Text?

Realtime text is text that is broadcast as you type, so that others can follow the conversation without waiting. 

Supporting realtime text (RTT) provides valuable accessibility support to people with disabilities (e.g deaf or hard-of-hearing), facilitating higher bandwidth conversations.

For more information about realtime text, see [realtimetext.org](http://www.realtimetext.org).

## Installing

```sh
$ npm install rtt-buffer 
```

## Building bundled/minified version (for AMD, etc)

```sh
$ grunt
```

The bundled and minified files will be in the generated `build` directory.

## Usage

```javascript
var rtt = require('rtt-buffer');

var display = new rtt.DisplayBuffer();

// Update the display state based on an RTT event
var rttEvent = {
    event: 'edit',
    actions: [
        { type: 'insert', text: 'Tea'},
        { type: 'wait', num: 32},
        { type: 'erase', num: 1},
        { type: 'wait', num: 28},
        { type: 'insert', text: 'st'}
    ]
};
display.process(rttEvent);
```

The `display.text` field can be bound to a template to render the incoming text.

```javascript
var input = new rtt.InputBuffer();

// Whenever the input source changes
input.update("New full text of message");

// Generate an RTT event based on changes since the last event.
var rttEvent = input.diff();
```

## License

MIT

## Created By

If you like this, follow [@lancestout](http://twitter.com/lancestout) on twitter.
