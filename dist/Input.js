"use strict";
var Input = (function () {
    function Input(size) {
        this.size = size;
    }
    Input.prototype.init = function (network, boundary) {
        if (boundary != null) {
            throw new Error('\'Input\' must be the first layer of the network!');
        }
        var layer = network.addLayer(this.size);
        return {
            width: this.size,
            height: 1,
            depth: 1,
            layer: layer
        };
    };
    return Input;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input;
//# sourceMappingURL=Input.js.map