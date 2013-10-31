var parsers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var BitArray = require('node-bitarray');
var debug = require('debug')('modbus:tcp:client:parsers:read2words');

function parse(binary, callback) {
    var that = this;
    var values = [];
    binary
    .word16be('adress')
    .word16be('value')
    .tap(function(val) {
        callback(null, val.value);
    });
}

function parseCoil(binary, callback) {
    parse(binary, function(err, val) {
        if (!err)
            val = val ? true : false;

        callback(err, val);
    });
}

parsers.register(consts.Functions.WRITE_SINGLE_COIL, parseCoil);
parsers.register(consts.Functions.WRITE_SINGLE_REGISTER, parse);