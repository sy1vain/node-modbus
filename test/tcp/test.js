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

var modbus = require('../../lib');

// Tries to keep a connection alive after first request
var client = modbus.tcp.connect({
  port: '502',
  host: 'localhost',
  responseTimeout: 1000, // net.Socket.setTimeout
  noDelay: true // net.Socket.setNoDelay
});

setInterval(function() {
  client.request({
    unit: 1, // Slave ID
    func: modbus.Functions.READ_COILS, // MODBUS function code
    address: 0, // 0-65535
    count: 16,
    //type: modbustcp.DataTypes.Int16,
    response: function(err, res) {
      if (err) {
        if (err instanceof modbus.Errors.ArgumentError) {
          // Invalid arguments
          console.log(err);
        }
        if (err instanceof modbus.Errors.ConnectionError) {
          // Can't establish a connection
          console.log(err);
        }
        /*if (err instanceof modbus.Errors.TimeoutError) {
          // Communication timed out
        }*/
        if (err instanceof modbus.Errors.RequestError) {
          // Exception returned from slave
          console.log(err);
        }
        // retry or skip
        return;
      }
      // do something
      console.log(res);
    }
  });  
}, 500);
