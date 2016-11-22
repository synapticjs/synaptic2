"use strict";
var Engine_1 = require("../Engine");
var ZeroPadding = (function () {
    function ZeroPadding(padding) {
        this.padding = padding;
        this.layer = null;
    }
    ZeroPadding.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'ZeroPadding\' cannot be the first layer of the network!');
        }
        this.layer = network.addLayer();
        var x, y, z, from, to;
        for (z = 0; z < boundary.depth; z++) {
            for (y = 0; y < boundary.height; y++) {
                for (x = -this.padding; x < boundary.width + this.padding; x++) {
                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
                    this.layer.push(unit);
                    if (!this.isPadding(boundary, x, y, z)) {
                        to = unit;
                        from = boundary.layer[x + y * boundary.height + z * boundary.height * boundary.depth];
                        network.addConnection(from, to);
                    }
                }
            }
        }
        return {
            width: boundary.width + this.padding * 2,
            height: boundary.height,
            depth: boundary.height,
            layer: this.layer
        };
    };
    ZeroPadding.prototype.isPadding = function (boundary, x, y, z) {
        return x < 0 ||
            x > boundary.width ||
            y < 0 ||
            y > boundary.height ||
            z < 0 ||
            z > boundary.depth;
    };
    return ZeroPadding;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ZeroPadding;
//# sourceMappingURL=ZeroPadding.js.map