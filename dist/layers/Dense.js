"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Dense = (function () {
    function Dense(size) {
        this.size = size;
    }
    Dense.prototype.init = function (network, boundary) {
        var _this = this;
        if (boundary == null) {
            throw new Error('\'Dense\' can\'t be the first layer of the network!');
        }
        this.layer = network.addLayer(this.size);
        // connect all units from previous layer to this one
        boundary.layer.forEach(function (from) {
            _this.layer.forEach(function (to) {
                network.addConnection(from, to);
            });
        });
        // set the boundary for next layer
        return {
            width: this.size,
            height: 1,
            depth: 1,
            layer: this.layer
        };
    };
    return Dense;
}());
exports.default = Dense;
//# sourceMappingURL=Dense.js.map