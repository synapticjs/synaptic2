"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("../Engine");
var Dropout = (function () {
    function Dropout(chances) {
        this.chances = chances;
        this.gater = null;
        this.layer = null;
    }
    Dropout.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'Dropout\' can\'t be the first layer of the network!');
        }
        this.gater = network.addLayer();
        this.layer = network.addLayer();
        var unit, from, to, gate;
        for (var i = 0; i < boundary.layer.length; i++) {
            unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
            this.layer.push(unit);
            from = boundary.layer[i];
            to = unit;
            // add a connection with a fixed weight of 1
            network.addConnection(from, to, 1);
            // this unit will act as a gate, randomly dropping inputs
            var gate_1 = network.addUnit(Engine_1.ActivationTypes.DROPOUT);
            network.addGate(from, to, gate_1);
            this.gater.push(gate_1);
            // use the unit's state to store the chances to drop
            network.engine.state[gate_1] = this.chances;
            // self-connect the unit so it keeps its state
            network.addConnection(gate_1, gate_1);
        }
        // this layer doesn't change the boundary's dimensions
        return {
            width: boundary.width,
            height: boundary.height,
            depth: boundary.depth,
            layer: this.layer
        };
    };
    return Dropout;
}());
exports.default = Dropout;
//# sourceMappingURL=Dropout.js.map