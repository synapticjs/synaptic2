"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Input2D = (function () {
    function Input2D(width, height) {
        this.width = width;
        this.height = height;
        this.layer = null;
    }
    Input2D.prototype.init = function (network, boundary) {
        if (boundary != null) {
            throw new Error('\'Input2D\' must be the first layer of the network!');
        }
        this.layer = network.addLayer(this.width, this.height);
        // set the boundary for next layer
        return {
            width: this.width,
            height: this.height,
            depth: 1,
            layer: this.layer
        };
    };
    return Input2D;
}());
exports.default = Input2D;
//# sourceMappingURL=Input2D.js.map