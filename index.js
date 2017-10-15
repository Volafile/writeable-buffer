const stream = require('stream');
const async = require('async');

class StreamBuffer extends stream.Writable {
    constructor(options) {
        super(options);

        options = options || {};

        this.maxBufferSize = options.maxBufferSize || StreamBuffer.MAX_BUFFER_SIZE;

        this.buffered = [];
        this.bufferedAmount = 0;

        this.hadError = null;
        this.didFinish = false;

        this.once('finish', () => this.didFinish = true);
        this.once('error', (error) => this.hadError = error);
    }

    _write(chunk, encoding, callback) {
        if (this.bufferedAmount === this.maxBufferSize)
            return setImmediate(callback);

        if (this.bufferedAmount + chunk.length > this.maxBufferSize) {
            chunk = chunk.slice(0, this.maxBufferSize - this.bufferedAmount);
        }

        this.bufferedAmount += chunk.length;

        this.buffered.push(chunk);

        setImmediate(callback);
    }

    toString(encoding, callback) {
        if (typeof encoding === 'function') {
            callback = encoding;
            encoding = 'utf8';
        }

        encoding = encoding || 'utf8';

        if (!callback) {
            return this.toBuffer().toString(encoding);
        }

        this.toBuffer((error, buffer) => {
            if (error) return callback(error);

            callback(null, buffer.toString(encoding));
        });
    }

    toBuffer(callback) {
        if (!callback) {
            return Buffer.concat(this.buffered);
        }

        if (this.hadError || this.didFinish) {
            return setImmediate(callback, this.hadError, this.toBuffer());
        }

        async.race([
            (callback) => this.on('error', callback),
            (callback) => this.on('finish', () => callback(null, this.toBuffer()))
        ], callback);
    }
}

StreamBuffer.MAX_BUFFER_SIZE = 10 * 1024 * 1024;

module.exports = StreamBuffer;
