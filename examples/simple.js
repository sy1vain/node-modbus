
var modbus = require('../lib');

// Tries to keep a connection alive after first request
var client = modbus.tcp.connect({
  port: '502',
  host: 'localhost',
  responseTimeout: 400, // net.Socket.setTimeout
  noDelay: true // net.Socket.setNoDelay
});

var handleResponse = function(err, res) {
  if (err) {
    if (err instanceof modbus.Errors.ArgumentError) {
      // Invalid arguments
      console.log('', err);
    }
    if (err instanceof modbus.Errors.ConnectionError) {
      // Can't establish a connection
      console.log('', err);
    }
    if (err instanceof modbus.Errors.TimeoutError) {
      // Communication timed out
      console.log('', err);
    }
    if (err instanceof modbus.Errors.RequestError) {
      // Exception returned from slave
      console.log('', err);
    }
    // retry or skip
    return;
  }
  // do something
  console.log('', res);
}


client.request({
  unit: 1, // Slave ID
  func: modbus.Functions.WRITE_MULTIPLE_REGISTERS, // MODBUS function code
  address: 7200, // 0-65535
  value: [10, 258],
  type: modbus.Types.INT32,
  response: handleResponse
});

client.request({
    unit: 1, // Slave ID
    func: modbus.Functions.WRITE_MULTIPLE_REGISTERS, // MODBUS function code
    address: 7202, // 0-65535
    value: 400000,
    type: modbus.Types.INT32,
    response: handleResponse
  });


setTimeout(function(){
client.request({
    unit: 1, // Slave ID
    func: modbus.Functions.READ_HOLDING_REGISTERS, // MODBUS function code
    address: 7200, // 0-65535
    count: 3,
    type: modbus.Types.INT32,
    response: handleResponse
})
}, 5000);
