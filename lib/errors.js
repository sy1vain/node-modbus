var util = require('util');

var ArgumentError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(ArgumentError, Error);
ArgumentError.prototype.name = 'Argument Error';
module.exports.ArgumentError = ArgumentError;

var ConnectionError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(ConnectionError, Error);
ConnectionError.prototype.name = 'Connection Error';
module.exports.ConnectionError = ConnectionError;

var TimeoutError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(TimeoutError, Error);
TimeoutError.prototype.name = 'Timeout Error';
module.exports.TimeoutError = TimeoutError;

var RequestError = function (msg, constr) {
    Error.captureStackTrace(this, constr || this);
    this.message = msg || 'Error';
}
util.inherits(RequestError, Error);
RequestError.prototype.name = 'Request Error';
module.exports.RequestError = RequestError;