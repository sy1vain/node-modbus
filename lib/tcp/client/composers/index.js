var composers = {};

module.exports.get = function(func) {
    return composers[func];
}

module.exports.register = function(func, composer) {
    composers[func] = composer;
}

require('fs').readdirSync(__dirname + '/').forEach(function(file) {
  if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    require('./' + file);
  }
});