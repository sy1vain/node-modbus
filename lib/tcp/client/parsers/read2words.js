var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var BitArray = require('node-bitarray');
var debug = require('debug')('modbus:tcp:client:parsers:read2words');

function parse(binary, type, callback) {
    var that = this;
    binary.word16be('address');
    binary.word16be('value');
    binary.tap(function(val) {
        callback(null, 2*val.value/type);
    });
}

function parseCoil(binary, type, callback) {
    parse(binary, function(err, val) {
        if (!err)
            val = val ? true : false;

        callback(err, val);
    });
}

parsers.register(consts.Functions.WRITE_SINGLE_COIL, parseCoil);
parsers.register(consts.Functions.WRITE_SINGLE_REGISTER, parse);
parsers.register(consts.Functions.WRITE_MULTIPLE_COILS, parse);
parsers.register(consts.Functions.WRITE_MULTIPLE_REGISTERS, parse);