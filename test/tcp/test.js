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

var modbustcp = require('../../lib/tcp');
//var modbustcp = require('../../lib').tcp;

// Tries to keep a connection alive after first request
var client = modbustcp.connect({
  port: '502',
  host: 'localhost',
  responseTimeout: 1000, // net.Socket.setTimeout
  noDelay: true // net.Socket.setNoDelay
});

client.request({
  unit: 1, // Slave ID
  func: modbustcp.Functions.ReadCoils, // MODBUS function code
  address: 0, // 0-65535
  count: 1,
  //type: modbustcp.DataTypes.Int16,
  response: function(err, res) {
    if (err) {
      /*if (err instanceof ArgumentError) {
        // Invalid arguments
      }
      if (err instanceof ConnectionError) {
        // Can't establish a connection
      }
      if (err instanceof TimeoutError) {
        // Communication timed out
      }
      if (err instanceof RequestError) {
        // Exception returned from slave
      }*/
      // retry or skip
      return;
    }
    // do something
  }
});
