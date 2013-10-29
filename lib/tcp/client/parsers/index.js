var debug = require('debug')('modbus:tcp:client:parsers');
var parsers = {};

module.exports.get = function(func) {
    return parsers[func];
}

module.exports.register = function(func, parser) {
    debug('Registering %d', func);
    parsers[func] = parser;
}

require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    require('./' + file);
  }
});