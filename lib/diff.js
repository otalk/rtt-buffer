var punycode = require('punycode');


module.exports = function (oldText, newText) {
    var oldLen = oldText.length;
    var newLen = newText.length;

    var searchLen = Math.min(oldLen, newLen);

    var prefixSize = 0;
    for (prefixSize = 0; prefixSize < searchLen; prefixSize++) {
        if (oldText[prefixSize] !== newText[prefixSize]) {
            break;
        }
    }

    var suffixSize = 0;
    for (suffixSize = 0; suffixSize < searchLen - prefixSize; suffixSize++) {
        if (oldText[oldLen - suffixSize - 1] !== newText[newLen - suffixSize - 1]) {
            break;
        }
    }

    var matchedSize = prefixSize + suffixSize;
    var events = [];

    if (matchedSize < oldLen) {
        events.push({
            type: 'erase',
            pos: oldLen - suffixSize,
            num: oldLen - matchedSize
        });
    }

    if (matchedSize < newLen) {
        var insertedText = newText.slice(prefixSize, prefixSize + newLen - matchedSize);

        events.push({
            type: 'insert',
            pos: prefixSize,
            text: punycode.ucs2.encode(insertedText)
        });
    }

    return events;
};
