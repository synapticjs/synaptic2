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