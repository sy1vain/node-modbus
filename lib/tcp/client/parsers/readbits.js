var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var BitArray = require('node-bitarray');
var debug = require('debug')('modbus:tcp:client:parsers:readbits');

function parse(binary, type, callback) {
    var that = this;
    var values = [];
    binary.word8('byteCount').tap(function(val) {
        this.buffer('value', val.byteCount).tap(function(vals) {
            var rtn = [];
            for (var i = 0; i < val.byteCount; ++i) {
                rtn = rtn.concat(
                    // The LSB of the first data byte contains the output addressed in the query.
                    BitArray.fromBuffer(new Buffer([vals.value[i]]))
                            .reverse()
                );
            }
            debug('Values', rtn);
            callback(null, rtn);
        });
    });
}

parsers.register(consts.Functions.READ_COILS, parse);
parsers.register(consts.Functions.READ_DISCRETE_INPUTS, parse);