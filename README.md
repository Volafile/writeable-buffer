writeable-buffer
================

A Writeable that buffers all data it receives up to `maxBufferSize` (default 10 MB).

If `.toString([[encoding,] callback])` or `toBuffer([callback])` are called with a callback,
they become asynchronous and wait until the stream has been ended with stream.end() or
an error occured. Without a callback they return all data buffered at that time.

Usage:

```js
const WritableBuffer = require('writeable-buffer');

const buffer = new WritableBuffer({
    maxBufferSize: 5000, // Only buffer up to 5kb
});

stream.pipe(buffer, { end : true });

buffer.toString('utf8', (error, string) => {
    console.log(string);
});
```
