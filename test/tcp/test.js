/*global describe: false, it: false*/
/*
var assert = require('assert');

describe('ModbusAddress', function() {
  describe('coil modicon', function() {
    var coil = 12;

    it ('should parse coil function', function() {
      assert.equal(coil, 12);
    });
    it ('should parse coil address', function() {
      assert.equal(coil, 12);
    });
  });
});
*/

var debug = require('debug')('test');
var modbus = require('../../lib');

// Tries to keep a connection alive after first request
var client = modbus.tcp.connect({
  port: '502',
  host: 'localhost',
  responseTimeout: 400, // net.Socket.setTimeout
  noDelay: true // net.Socket.setNoDelay
});

setInterval(function() {
  client.request({
    unit: 1, // Slave ID
    func: modbus.Functions.READ_HOLDING_REGISTERS, // MODBUS function code
    address: 0, // 0-65535
    count: 10,
    //type: modbustcp.DataTypes.Int16,
    response: function(err, res) {
      if (err) {
        if (err instanceof modbus.Errors.ArgumentError) {
          // Invalid arguments
          debug('', err);
        }
        if (err instanceof modbus.Errors.ConnectionError) {
          // Can't establish a connection
          debug('', err);
        }
        if (err instanceof modbus.Errors.TimeoutError) {
          // Communication timed out
          debug('', err);
        }
        if (err instanceof modbus.Errors.RequestError) {
          // Exception returned from slave
          debug('', err);
        }
        // retry or skip
        return;
      }
      // do something
      debug('', res);
    }
  });
}, 500);
