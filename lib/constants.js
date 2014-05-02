// An exception response from a MODBUS slave (server) will have
// the high-bit (0x80) set on it's function code.
module.exports.EXCEPTION_BIT = 1 << 7;

module.exports.Exceptions = {
  1 : 'Illegal Function',
  2 : 'Illegal Data Address',
  3 : 'Illegal Data Value',
  4 : 'Slave Device Failure',
  5 : 'Acknowledge',
  6 : 'Slave Device Busy',
  8 : 'Memory Parity Error',
  10: 'Gateway Path Unavailable',
  11: 'Gateway Target Path Failed to Respond'
};

// Each of the function codes has a potentially different body payload
// and potentially different parameters to send. Each function code needs
// a 'request' and 'response' parser in the "client.js" and "server.js" files.
module.exports.Functions = {
  READ_COILS:                        1,
  READ_DISCRETE_INPUTS:              2,
  READ_HOLDING_REGISTERS:            3,
  READ_INPUT_REGISTERS:              4,
  WRITE_SINGLE_COIL:                 5,
  WRITE_SINGLE_REGISTER:             6,
  READ_EXCEPTION_STATUS:             7, // Serial Line only
  DIAGNOSTICS:                       8, // Serial Line only
  PROGRAM_484:                       9,
  POLL_484:                         10,
  GET_COMM_EVENT_COUNTER:           11, // Serial Line only
  GET_COMM_EVENT_LOG:               12, // Serial Line only
  PROGRAM_CONTROLLER:               13,
  POLL_CONTROLLER:                  14,
  WRITE_MULTIPLE_COILS:             15,
  WRITE_MULTIPLE_REGISTERS:         16,
  REPORT_SLAVE_ID:                  17, // Serial Line only
  PROGRAM_884_M84:                  18,
  RESET_COMM_LINK:                  19,
  READ_FILE_RECORD:                 20,
  WRITE_FILE_RECORD:                21,
  MASK_WRITE_REGISTER:              22,
  READ_WRITE_MULTIPLE_REGISTERS:    23,
  READ_FIFO_QUEUE:                  24,
  ENCAPSULATED_INFERFACE_TRANSPORT: 43
};

module.exports.Types = {
  INT16:  2,
  INT32:  4
};