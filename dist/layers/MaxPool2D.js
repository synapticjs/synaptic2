"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("../Engine");
var MaxPool2D = (function () {
    function MaxPool2D(downsampling) {
        if (downsampling === void 0) { downsampling = 2; }
        this.downsampling = downsampling;
        this.gater = null;
        this.layer = null;
    }
    MaxPool2D.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'MaxPool2D\' can\'t be the first layer of the network!');
        }
        this.gater = network.addLayer();
        this.layer = network.addLayer();
        var x, y, z, fromX, fromY, fromZ;
        for (var z_1 = 0; y < boundary.depth; z_1++) {
            for (var y_1 = 0; y_1 < boundary.height; y_1 += this.downsampling) {
                for (var x_1 = 0; x_1 < boundary.width; x_1 += this.downsampling) {
                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
                    this.layer.push(unit);
                    for (var offsetY = 0; offsetY < this.downsampling; offsetY++) {
                        for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {
                            fromX = x_1 + offsetX;
                            fromY = y_1 + offsetY;
                            fromZ = z_1;
                            if (this.isValid(boundary, fromX, fromY, fromZ)) {
                                var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
                                var to = unit;
                                network.addConnection(from, to, 1);
                                // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
                                var gate = network.addUnit(Engine_1.ActivationTypes.MAX_POOLING);
                                network.addGate(from, to, gate);
                                this.gater.push(gate);
                                // connect the unit from the previous layer as an input of the gate so each gate knows which input they are gating
                                network.addConnection(from, gate);
                            }
                        }
                    }
                }
            }
        }
        // set the boundary for next layer
        return {
            width: boundary.width / this.downsampling | 0,
            height: boundary.height / this.downsampling | 0,
            depth: boundary.depth,
            layer: this.layer
        };
    };
    // returns true if the coords fall within the layer area
    MaxPool2D.prototype.isValid = function (boundary, x, y, z) {
        return x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height &&
            z > 0 &&
            z < boundary.depth;
    };
    return MaxPool2D;
}());
exports.default = MaxPool2D;
//# sourceMappingURL=MaxPool2D.js.map