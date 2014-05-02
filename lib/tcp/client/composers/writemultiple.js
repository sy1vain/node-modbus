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
    if(misc.isNumber(options.value)){
        options.value = [options.value];
    }

    if (!Array.isArray(options.value)) {
        throw new errors.ArgumentError('Value is not specified or not an array');
    }

    if(options.type==consts.Types.INT32){
        options.address = options.address|(1<<14);
    }

    var buffer = new BufferPut();
    buffer.word16be(options.address);
    buffer.word16be(options.value.length*options.type/2);
    buffer.word8be(options.value.length*options.type);

    for(var i=0; i<options.value.length; i++){
        var value = options.value[i];
        if(!misc.isNumber(value)){
            throw new errors.ArgumentError('Value is not specified correctly');
        }
        switch(options.type){
            case consts.Types.INT16:
                buffer.word16be(value);
                break;
            case consts.Types.INT32:
                buffer.word32be(value);
                break;
            default:
                throw new errors.ArgumentError('Unknown type');
        }
    }

    return buffer.buffer();
}

composers.register(consts.Functions.WRITE_MULTIPLE_REGISTERS, compose);