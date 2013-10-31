var composers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var debug = require('debug')('modbus:tcp:client:composers:write2words');

function compose(options) {
    debug('Dumping options', options);
    if (!misc.isNumber(options.address)) {
        throw new errors.ArgumentError('Address is not specified');
    }
    if (!misc.isNumber(options.value)) {
        throw new errors.ArgumentError('Value is not specified');
    }

    return (new BufferPut())
            .word16be(options.address)
            .word16be(options.value)
            .buffer();
}

composers.register(consts.Functions.WRITE_SINGLE_REGISTER, compose);