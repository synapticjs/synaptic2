"use strict";
var defaults = {
    peepholes: true
};
var LSTM = (function () {
    function LSTM(memoryBlocks, _a) {
        var peepholes = (_a === void 0 ? defaults : _a).peepholes;
        this.memoryBlocks = memoryBlocks;
        this.prevLayer = null;
        this.nextLayer = null;
        this.inputGate = null;
        this.forgetGate = null;
        this.memoryCell = null;
        this.outputGate = null;
        this.peepholes = peepholes;
    }
    LSTM.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'LSTM\' cannot be the first layer of the network!');
        }
        this.prevLayer = boundary.layer;
        this.inputGate = network.addLayer(this.memoryBlocks);
        this.forgetGate = network.addLayer(this.memoryBlocks);
        this.memoryCell = network.addLayer(this.memoryBlocks);
        this.outputGate = network.addLayer(this.memoryBlocks);
        connectLayers(network, this.prevLayer, this.memoryCell);
        connectLayers(network, this.memoryCell, this.memoryCell);
        connectLayers(network, this.prevLayer, this.inputGate);
        connectLayers(network, this.prevLayer, this.forgetGate);
        connectLayers(network, this.prevLayer, this.outputGate);
        gateLayer(network, this.inputGate, this.memoryCell, 'INBOUND');
        gateLayer(network, this.forgetGate, this.memoryCell, 'SELF');
        return {
            width: this.memoryCell.length,
            height: 1,
            depth: 1,
            layer: this.memoryCell
        };
    };
    LSTM.prototype.reverseInit = function (network, boundary) {
        this.nextLayer = boundary.layer;
        connectLayers(network, this.prevLayer, this.nextLayer);
        gateLayer(network, this.outputGate, this.memoryCell, 'OUTBOUND');
        if (this.peepholes) {
            connectLayers(network, this.memoryCell, this.inputGate);
            connectLayers(network, this.memoryCell, this.forgetGate);
            connectLayers(network, this.memoryCell, this.outputGate);
        }
    };
    return LSTM;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LSTM;
function connectLayers(network, from, to, connectionType) {
    from.forEach(function (neuronA, indexA) {
        to.forEach(function (neuronB, indexB) {
            if (from !== to || indexA === indexB) {
                network.addConnection(neuronA, neuronB);
            }
        });
    });
}
function gateLayer(network, gaterLayer, gatedLayer, gateType) {
    var from, to, gater;
    var _loop_1 = function (index) {
        switch (gateType) {
            case 'SELF':
                from = gatedLayer[index];
                to = gatedLayer[index];
                gater = gaterLayer[index];
                network.addGate(from, to, gater);
                break;
            case 'INBOUND':
                to = gatedLayer[index];
                gater = gaterLayer[index];
                network.engine.connections
                    .filter(function (connection) { return connection.to === to; })
                    .filter(function (connection) { return connection.from !== to; })
                    .map(function (connection) { return connection.from; })
                    .forEach(function (from) { return network.addGate(from, to, gater); });
                break;
            case 'OUTBOUND':
                gatedLayer.forEach(function (neuron) {
                    from = gatedLayer[index];
                    gater = gaterLayer[index];
                    network.engine.connections
                        .filter(function (connection) { return connection.from === from; })
                        .filter(function (connection) { return connection.to !== from; })
                        .map(function (connection) { return connection.to; })
                        .forEach(function (to) { return network.addGate(from, to, gater); });
                });
                break;
        }
    };
    for (var index = 0; index < gaterLayer.length; index++) {
        _loop_1(index);
    }
}
//# sourceMappingURL=LSTM.js.map