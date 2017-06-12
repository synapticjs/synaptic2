function interpolateBoundary(t, a, b) {

  return Math.min(Math.max(a, a + t * (b - a)), b);
}

module.exports.printError = function (error) {
  var width = 100;

  var spaces = width - interpolateBoundary(error, 0, width)

  var progress = (new Array(width)).fill(' ')

  progress = progress.map(($, $$) => $$ <= spaces ? '=' : ' ').join('')

  console.log('Error: ' + error.toFixed(6) + ' [' + progress + ']');
}

const braile = ' ⡀⣀⣄⣤⣴⣶⣾⣿'

module.exports.every = function (predicted, target, error) {
  var width = 100;

  var spaces = width - interpolateBoundary(error, 0, width)

  var progress = (new Array(predicted.length)).fill(0).map(($, $$) => target[$$] - predicted[$$]);

  var max = Math.max(...progress);
  var min = Math.min(...progress);

  progress = progress.map($ => ($ - min) / (max - min))

  console.log('Prediction error: ' + error.toFixed(6) + ' [' + progress.map($ => braile[($ * 8) | 0]).join('') + ']');
}