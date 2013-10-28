var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var debug = require('debug')('modbus:tcp:client:parsers:readcoils');

function parse(binary, callback) {
    var that = this;
    var values = [];
    binary.word8('byteCount').tap(function(val) {
        debug('Byte count', val.byteCount);
        var byteCount = val.byteCount;
        var i = 0;
        if (byteCount > 0) {
            this.loop(function(end, vals) {
                this.word8('value.' + i);
                if (byteCount === 0) {
                    end();
                }
                byteCount--;
                i++;
            }).tap(function(vals) {
                callback(null, vals.value);
            });
        }
    });
}

parsers.register(consts.Functions.READ_COILS, parse);