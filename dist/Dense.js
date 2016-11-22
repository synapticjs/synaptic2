"use strict";
var Dense = (function () {
    function Dense(size) {
        this.size = size;
    }
    Dense.prototype.init = function (network, boundary) {
        var _this = this;
        if (boundary == null) {
            throw new Error('\'Dense\' cannot be the first layer of the network!');
        }
        this.layer = network.addLayer(this.size);
        boundary.layer.forEach(function (from) {
            _this.layer.forEach(function (to) {
                network.addConnection(from, to);
            });
        });
        return {
            width: this.size,
            height: 1,
            depth: 1,
            layer: this.layer
        };
    };
    return Dense;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dense;
//# sourceMappingURL=Dense.js.map