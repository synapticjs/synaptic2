function interpolateBoundary(t, a, b) {

  return Math.min(Math.max(a, a + t * (b - a)), b);
}

module.exports.printError = function (error, errorSet) {
  var width = 50;

  var spaces = width - interpolateBoundary(error, 0, width)

  var progress = (new Array(width)).fill(' ')

  progress = progress.map(($, $$) => $$ <= spaces ? '=' : ' ').join('')

  return 'Error: ' + error.toFixed(6) + ' [' + progress + '] ' + (errorSet ? '\n' + module.exports.errorSet(errorSet) : "");
}

const braile = ' ⡀⣀⣄⣤⣴⣶⣾⣿'

module.exports.errorSet = function (errors) {
  var max = Math.max(...errors);

  errors = errors.map($ => $ / max)

  return 'Error set: [' + errors.map($ => braile[($ * 8) | 0] || ' ').join('') + ']';
}