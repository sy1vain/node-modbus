var Client = require('./client');
var Server = require('./server');

module.exports.connect = function(options) {
    return new Client(options);
}

module.exports.listen = function(options) {
    return new Server(options);
}