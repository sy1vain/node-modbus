var composers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var debug = require('debug')('modbus:tcp:client:composers:readcoils');

function compose(options) {
    debug('Dumping options', options);
    if (!misc.isNumber(options.address)) {
        throw new errors.ArgumentError('Address is not specified');
    }
    if (!misc.isNumber(options.count)) {
        throw new errors.ArgumentError('Count is not specified');
    }

    return (new BufferPut())
            .word16be(options.address)
            .word16be(options.count)
            .buffer();
}

composers.register(consts.Functions.READ_COILS, compose);