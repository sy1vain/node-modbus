var composers = require('./index');
var consts = require('../../../constants');
var misc = require('../../../misc');
var BufferPut = require('bufferput');
var debug = require('debug')('modbus:tcp:client:composers:readregisters');

function compose(options) {
    debug('Dumping options', options);
    if (!misc.isNumber(options.address)) {
        throw new errors.ArgumentError('Address is not specified');
    }
    if (!misc.isNumber(options.count)) {
        throw new errors.ArgumentError('Count is not specified');
    }

    if(options.type==consts.Types.INT32){
        //add an extra bit to the address
        options.address = options.address|(1<<14);
        //read double words
        options.count *= 2;
    }

    return (new BufferPut())
            .word16be(options.address)
            .word16be(options.count)
            .buffer();
}

composers.register(consts.Functions.READ_COILS, compose);
composers.register(consts.Functions.READ_DISCRETE_INPUTS, compose);
composers.register(consts.Functions.READ_HOLDING_REGISTERS, compose);
composers.register(consts.Functions.READ_INPUT_REGISTERS, compose);