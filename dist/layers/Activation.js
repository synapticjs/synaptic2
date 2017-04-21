"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("../Engine");
var ReLU = (function () {
    function ReLU() {
        this.layer = null;
    }
    ReLU.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'Activation.ReLU\' can\'t be the first layer of the network!');
        }
        var prevLayer = boundary.layer;
        this.layer = network.addLayer(prevLayer.length, Engine_1.ActivationTypes.RELU);
        for (var i = 0; i < prevLayer.length; i++) {
            network.addConnection(prevLayer[i], this.layer[i], 1);
        }
        // this layer doesn't change the boundary's dimensions
        return {
            width: boundary.width,
            height: boundary.height,
            depth: boundary.depth,
            layer: this.layer
        };
    };
    return ReLU;
}());
exports.ReLU = ReLU;
//# sourceMappingURL=Activation.js.map