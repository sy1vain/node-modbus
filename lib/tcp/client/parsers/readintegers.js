var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var BitArray = require('node-bitarray');
var debug = require('debug')('modbus:tcp:client:parsers:readintegers');

function parse(binary, type, callback) {
    var that = this;
    var values = [];
    binary.word8('byteCount').tap(function(val) {
        this.buffer('value', val.byteCount).tap(function(vals) {
            var result = [];
            for (var i = 0; i < val.byteCount; i += type) {
                switch(type){
                    case consts.Types.INT16:
                        result.push(val.value.readInt16BE(i));
                        break;
                    case consts.Types.INT32:
                        result.push(val.value.readInt32BE(i));
                        break;
                }
            }
            callback(null, result);
        });
    });
}

parsers.register(consts.Functions.READ_HOLDING_REGISTERS, parse);
parsers.register(consts.Functions.READ_INPUT_REGISTERS, parse);