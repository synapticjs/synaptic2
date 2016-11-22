"use strict";
var Input3D = (function () {
    function Input3D(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.layer = null;
    }
    Input3D.prototype.init = function (network, boundary) {
        if (boundary != null) {
            throw new Error('\'Input3D\' must be the first layer of the network!');
        }
        this.layer = network.addLayer(this.width, this.height, this.depth);
        return {
            width: this.width,
            height: this.height,
            depth: this.depth,
            layer: this.layer
        };
    };
    return Input3D;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input3D;
//# sourceMappingURL=Input3D.js.map