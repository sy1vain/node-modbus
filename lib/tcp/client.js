var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('modbus:tcp:client');
var async = require('async');
var Buffers = require('buffers');
var Binary = require('binary');
var BufferPut = require('bufferput');

// Errors

var ArgumentError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(ArgumentError, Error);
ArgumentError.prototype.name = 'Argument Error';

var ConnectionError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(ConnectionError, Error);
ConnectionError.prototype.name = 'Connection Error';

// Client object structure

function Client(options) {
    this.port = parseInt(options.port) || 502;
    this.host = options.host || 502;
    this.responseTimeout = options.responseTimeout || 1000;
    this.noDelay = options.noDelay || true;

    this.queue = [];
    this.requestIndex = 0;
    this.currentRequest = null;

    debug('Client constructed');
}
util.inherits(Client, EventEmitter);
module.exports = Client;

// The byte length of the "MODBUS Application Protocol" header.
const MBAP_LENGTH = 7;

// The byte length of the "MODBUS Function Code".
const FUNCTION_CODE_LENGTH = 1;

// An exception response from a MODBUS slave (server) will have
// the high-bit (0x80) set on it's function code.
const EXCEPTION_BIT = 1 << 7;

Client.prototype.protocolVersion = 0;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

Client.prototype.functionComposers = {
    1: function(options) {
        debug('Dumping options', options);
        if (!isNumber(options.address)) {
            throw new ArgumentError('Address is not specified');
        }
        if (!isNumber(options.count)) {
            throw new ArgumentError('Count is not specified');
        }

        return (new BufferPut())
                .word16be(options.address)
                .word16be(options.count)
                .buffer();
    }
};

Client.prototype.functionParsers = {
    1: function(binary, response) {
        var values = [];
        binary.word8('byteCount').tap(function(val) {
            this.loop(function(end, vals) {
                val.byteCount--;
                debug(vals);
                if (val.byteCount === 0) {
                    end();
                }
            }).tap(function(vals) {
                debug(vals);
            });
        });
    }
};

// Private implementation

Client.prototype._bindParser = function() {
    var that = this;
    this.b = Binary()
        .word16be('transactionId')
        .word16be('protocolVersion')
        .word16be('length')
        .word8('unit')
        .word8('func')
        .tap(function (header) {
            debug('Parsed MBAP', header);

            if (header.func & EXCEPTION_BIT) {
                debug('Got exception!');
                // TODO Exception
            } else if (that.functionParsers[header.func]) {
                that.functionParsers[header.func].call(that, this);
            }
        });
    this.socket.pipe(this.b);
}

Client.prototype._connect = function() {
    if (!this.socket) {
        debug('Creating new socket');
        this.socket = new net.Socket();
        this.socket.setTimeout(this.responseTimeout);
        //this.setNoDelay(this.noDelay);
    }

    if (!this.isConnected && !this.isConnecting) {
        this.isConnecting = true;
        debug('Connecting...');
        this.socket.connect(this.port, this.host, this._connected.bind(this));
        this.socket.on('close', this._onClose.bind(this));
        this.socket.on('error', this._onError.bind(this));
        this._bindParser();
    }
}

Client.prototype._connected = function() {
    debug('Connected!');
    this.isConnecting = false;
    this.isConnected = true;
    this._nextRequest();
}

Client.prototype._onClose = function() {
    debug('Connection closed');
    this.isConnecting = false;
    this.isConnected = false;
    if (this.currentRequest) {
        if (this.currentRequest.response)
            this.currentRequest.response(new ConnectionError('Connection closed'));

        this.currentRequest = null;
    }
    this.socket.destroy(); //?
    this.socket = null; //?
    this._connect();
}

Client.prototype._onError = function(err) {
    debug('Connection Error!', err);
    if (this.currentRequest) {
        if (this.currentRequest.response)
            this.currentRequest.response(new ConnectionError('Connection Error'));

        this.currentRequest = null;
    }
}

Client.prototype._nextRequest = function() {
    if (this.queue.length > 0) {
        this._request(this.queue.pop());
    }
}

// This function does the actual request
Client.prototype._request = function(options) {
    this.requestIndex++;
    this.requestIndex %= 0xFFFF; // 16-bit unsigned integer

    debug('Processing request number %d', this.requestIndex);

    var pdu;
    try {
        if (options.func instanceof Object) {
            pdu = options.func.apply(this, options);
        } else if (parseInt(options.func)) {
            var functionCode = parseInt(options.func);
            if (this.functionComposers[functionCode]) {
                pdu = this.functionComposers[functionCode].apply(this, [options]);
            }
        } else {
            throw new ArgumentError('Incorrect function specified');
        }
    } catch (e) {
        debug('Error occured while composing request', e, e.stack);
        options.response(new ArgumentError(e));
        return;
    }
    debug('Got pdu', pdu, pdu.length);

    var buf = (new BufferPut())
        .word16be(this.requestIndex)
        .word16be(this.protocolVersion)
        .word16be(pdu.length + 2)
        .word8(options.unit)
        .word8(options.func)
        .put(pdu)
        .buffer();

    debug('Sending buf', buf);

    this.socket.write(buf);
}

// Public Implementation

Client.prototype.request = function(options) {
    this._connect();

    this.queue.push(options);

    if (this.queue.length === 1 && this.isConnected) {
        this._request(this.queue.pop());
    }
}