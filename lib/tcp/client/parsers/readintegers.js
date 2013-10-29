var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var BitArray = require('node-bitarray');
var debug = require('debug')('modbus:tcp:client:parsers:readintegers');

function parse(binary, callback) {
    var that = this;
    var values = [];
    binary.word8('byteCount').tap(function(val) {
        this.buffer('value', val.byteCount).tap(function(vals) {
            debug('Byte count', val.byteCount);
            var byteCount = val.byteCount;
            var i = 0;
            if (byteCount > 0) {
                this.loop(function(end, vals) {
                    this.word16be('value.' + i);
                    if (byteCount === 0) {
                        end();
                    }
                    byteCount -= 2;
                    debug('byteCount', byteCount);
                    i++;
                }).tap(function(vals) {
                    debug('Values', vals);
                    that._response(null, vals);
                });
            }
        });
    });
}

parsers.register(consts.Functions.READ_HOLDING_REGISTERS, parse);
parsers.register(consts.Functions.READ_INPUT_REGISTERS, parse);