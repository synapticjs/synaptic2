"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this is a basic LSTM block, consisting of a memory cell, with input, forget and output gates
var LSTM = (function () {
    function LSTM(memoryBlocks, _a) {
        var _b = _a.peepholes, peepholes = _b === void 0 ? true : _b;
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
            throw new Error('\'LSTM\' can\'t be the first layer of the network!');
        }
        this.prevLayer = boundary.layer;
        this.inputGate = network.addLayer(this.memoryBlocks);
        this.forgetGate = network.addLayer(this.memoryBlocks);
        this.memoryCell = network.addLayer(this.memoryBlocks);
        this.outputGate = network.addLayer(this.memoryBlocks);
        // connection from previous layer to memory cell
        connectLayers(network, this.prevLayer, this.memoryCell);
        // self-connection from memory cell
        connectLayers(network, this.memoryCell, this.memoryCell);
        // connections from previous layer to gates
        connectLayers(network, this.prevLayer, this.inputGate);
        connectLayers(network, this.prevLayer, this.forgetGate);
        connectLayers(network, this.prevLayer, this.outputGate);
        // input and forget gates
        gateLayer(network, this.inputGate, this.memoryCell, 'INBOUND');
        gateLayer(network, this.forgetGate, this.memoryCell, 'SELF');
        // set the boundary for next layer
        return {
            width: this.memoryCell.length,
            height: 1,
            depth: 1,
            layer: this.memoryCell
        };
    };
    LSTM.prototype.reverseInit = function (network, boundary) {
        this.nextLayer = boundary.layer;
        // direct connection from prevLayer to nextLayer
        connectLayers(network, this.prevLayer, this.nextLayer);
        // output gate
        gateLayer(network, this.outputGate, this.memoryCell, 'OUTBOUND');
        // recurrent connections from each memory cell to each gates (aka peepholes) - Fig. 4 (b)
        if (this.peepholes) {
            connectLayers(network, this.memoryCell, this.inputGate);
            connectLayers(network, this.memoryCell, this.forgetGate);
            connectLayers(network, this.memoryCell, this.outputGate);
        }
    };
    return LSTM;
}());
exports.default = LSTM;
// ---
// helper to connect layers
function connectLayers(network, from, to, connectionType) {
    from.forEach(function (neuronA, indexA) {
        to.forEach(function (neuronB, indexB) {
            if (from !== to || indexA === indexB) {
                network.addConnection(neuronA, neuronB);
            }
        });
    });
}
// helper to gate layers
function gateLayer(network, gaterLayer, gatedLayer, gateType) {
    var from, to, gater;
    var _loop_1 = function (index) {
        switch (gateType) {
            // the gater layer will gate all the self connections of the gated layer
            case 'SELF':
                from = gatedLayer[index];
                to = gatedLayer[index];
                gater = gaterLayer[index];
                network.addGate(from, to, gater);
                break;
            // the gater layer will gate all the inbound connections into the gated layer
            case 'INBOUND':
                to = gatedLayer[index];
                gater = gaterLayer[index];
                network.engine.connections
                    .filter(function (connection) { return connection.to === to; }) // get all the connections projected into this unit
                    .filter(function (connection) { return connection.from !== to; }) // filter out self-connections
                    .map(function (connection) { return connection.from; }) // grab the unit projecting the connection
                    .forEach(function (from) { return network.addGate(from, to, gater); }); // add a gate for each such unit
                break;
            // the gater layer will gate all the outbound connections from the gated layer
            case 'OUTBOUND':
                gatedLayer.forEach(function (neuron) {
                    from = gatedLayer[index];
                    gater = gaterLayer[index];
                    network.engine.connections
                        .filter(function (connection) { return connection.from === from; }) // get all the connections projected from this unit
                        .filter(function (connection) { return connection.to !== from; }) // filter out self-connections
                        .map(function (connection) { return connection.to; }) // grab the unit receiving the connection
                        .forEach(function (to) { return network.addGate(from, to, gater); }); // add a gate for each such unit
                });
                break;
        }
    };
    for (var index = 0; index < gaterLayer.length; index++) {
        _loop_1(index);
    }
}
//# sourceMappingURL=LSTM.js.map