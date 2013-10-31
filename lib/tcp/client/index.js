var util = require('util');
var net = require('net');
var EventEmitter = require('events').EventEmitter;

var debug = require('debug')('modbus:tcp:client');
var async = require('async');
var Buffers = require('buffers');
var Binary = require('binary');
var BufferPut = require('bufferput');

var errors = require('../../errors');
var consts = require('../../constants');
var tcpConsts = require('../constants');
var misc = require('../../misc');
var composers = require('./composers');
var parsers = require('./parsers');

// Client object structure

function Client(options) {
    this.port = parseInt(options.port) || tcpConsts.DEFAULT_PORT;
    this.host = options.host || tcpConsts.DEFAULT_HOST;
    this.responseTimeout = options.responseTimeout || tcpConsts.DEFAULT_TIMEOUT;
    this.noDelay = options.noDelay || tcpConsts.DEFAULT_SETNODELAY;

    this.queue = [];
    this.requestIndex = 0;
    this.currentRequest = null;

    debug('Client constructed');
}
util.inherits(Client, EventEmitter);
module.exports = Client;


Client.prototype.protocolVersion = tcpConsts.MODBUS_PROTOCOL_VERSION;

// Private implementation

Client.prototype._response = function() {
    debug('Calling response...');
    if (this.currentRequest) {
        debug('Found current request...');
        if (this.currentRequest.response) {
            debug('Found current request\'s response...');
            this.currentRequest.response.apply(this, arguments);
        }
    }
}

Client.prototype._bindParser = function() {
    var that = this;

    if (this.b)
        this.socket.unpipe(this.b);

    this.b = null;

    this.b = Binary()
        .word16be('transactionId')
        .word16be('protocolVersion')
        .word16be('length')
        .word8('unit')
        .word8('func')
        .tap(function (header) {
            debug('Parsed MBAP');

            if (header.func & consts.EXCEPTION_BIT) {
                this.word8('exception').tap(function(val) {
                    debug('Got exception code: %d', val.exception);
                    that._response(new errors.RequestError(consts.Exceptions[val.exception]));
                });
            } else if (header.func !== that.currentRequest.func) {
                that._response(new errors.RequestError('Wrong function response returned'));
            } else {
                var functionParser = parsers.get(header.func);
                if (functionParser) {
                    functionParser.call(that, this, function(err, values) {
                        that._response(err, values);
                        that.currentRequest = null;
                        that.socket.setTimeout(0);
                        that._nextRequest();
                    });
                }
            }
        });
    this.socket.pipe(this.b);
}

Client.prototype._connect = function() {
    if (!this.socket) {
        debug('Creating new socket');
        this.socket = new net.Socket();
        this.socket.setTimeout(this.responseTimeout);
        this.socket.setNoDelay(this.noDelay);
    }

    if (!this.isConnected && !this.isConnecting) {
        this.isConnecting = true;
        debug('Connecting...');
        this.socket.connect(this.port, this.host, this._connected.bind(this));
        this.socket.on('close', this._onClose.bind(this));
        this.socket.on('error', this._onError.bind(this));
        this.socket.on('timeout', this._onTimeout.bind(this));
    }
}

Client.prototype._connected = function() {
    debug('Connected!');
    this.isConnecting = false;
    this.isConnected = true;
    this._nextRequest();
}

// Remote server closed the connection
Client.prototype._onClose = function() {
    debug('Connection closed');
    this.isConnecting = false;
    this.isConnected = false;
    if (this.currentRequest) {
        if (this.currentRequest.response)
            this.currentRequest.response(new errors.ConnectionError('Connection closed'));

        this.currentRequest = null;
    }
    this.socket.destroy(); //?
    this.socket = null; //?
    this._connect();
}

// Got error from socket. Note that _onClose event will be called after this
Client.prototype._onError = function(err) {
    debug('Connection Error!', err);
    if (this.currentRequest) {
        if (this.currentRequest.response)
            this.currentRequest.response(new errors.ConnectionError('Connection Error'));

        this.currentRequest = null;
    }
}

Client.prototype._onTimeout = function(err) {
    debug('Connection timeout!', err);

    var cr = this.currentRequest;
    // Getting last request from queue if we couldn't connect to the server yet.
    // TODO we may need another timeout for clarity.
    if (!cr) {
        cr = this.queue.pop();
    }
    if (cr) {
        debug('cr', cr);
        if (cr.response)
            cr.response(new errors.TimeoutError('Timeout Error'));

        this.currentRequest = null;
    }
    this.socket.destroy();
}

// Tries to process next request
Client.prototype._nextRequest = function() {
    if (this.queue.length > 0) {
        debug('Processing next request');
        this._request(this.queue.pop());
    }
}

// This function does the actual request
Client.prototype._request = function(options) {
    this.requestIndex++;
    this.requestIndex %= 0xFFFF; // 16-bit unsigned integer

    debug('Processing request number %d', this.requestIndex);
    this.currentRequest = options;
    // Create a new parser for this connection
    this._bindParser();

    var pdu;
    try {
        if (parseInt(options.func)) {
            var functionCode = parseInt(options.func);
            var functionComposer = composers.get(functionCode);
            if (functionComposer) {
                pdu = functionComposer.call(this, options);
            }
        } else {
            throw new errors.ArgumentError('Incorrect function specified');
        }
    } catch (e) {
        debug('Error occured while composing request', e, e.stack);
        options.response(new errors.ArgumentError(e));
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
    if (this.queue.length > 10) {
        console.error('MODBUS Request queue is full! Current request queue length is %d', this.queue.length);
    }
    debug('New request pushed to the queue. Queue length: %d', this.queue.length);

    if (this.queue.length === 1 && this.isConnected && this.currentRequest === null) {
        this._request(this.queue.pop());
    }
}