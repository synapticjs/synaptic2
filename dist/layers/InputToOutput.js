"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this is a direct all-to-all connection from input to output
var Direct = (function () {
    function Direct() {
    }
    Direct.prototype.reverseInit = function (network, boundary) {
        if (boundary != null) {
            throw new Error('\'InputToOutput\' must be the last layer of the network!');
        }
        var layers = network.getLayers();
        var inputLayer = layers[0];
        var outputLayer = layers[layers.length - 1];
        inputLayer.forEach(function (from) {
            outputLayer.forEach(function (to) {
                network.addConnection(from, to);
            });
        });
    };
    return Direct;
}());
exports.default = Direct;
//# sourceMappingURL=InputToOutput.js.map