"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this is based on this article: http://cs231n.github.io/convolutional-networks/
var Convolution3D = (function () {
    function Convolution3D(_a) {
        var _b = _a.filter, filter = _b === void 0 ? 1 : _b, _c = _a.stride, stride = _c === void 0 ? 1 : _c, _d = _a.padding, padding = _d === void 0 ? 0 : _d;
        this.filter = filter;
        this.stride = stride;
        this.padding = padding;
        this.layer = null;
    }
    Convolution3D.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'Convolution3D\' can\'t be the first layer of the network!');
        }
        this.layer = network.addLayer();
        var x, y, z, fromX, fromY, fromZ, from, to;
        for (z = this.padding; z < boundary.depth - this.padding; z += this.stride) {
            for (y = this.padding; y < boundary.height - this.padding; y += this.stride) {
                for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {
                    // create convolution layer units
                    var unit = network.addUnit();
                    this.layer.push(unit);
                    // connect units to prev layer
                    var filterRadious = this.filter / 2;
                    for (var offsetZ = -filterRadious; offsetZ < filterRadious; offsetZ++) {
                        for (var offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
                            for (var offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
                                fromX = Math.round(x + offsetX);
                                fromY = Math.round(y + offsetY);
                                fromZ = Math.round(y + offsetZ);
                                if (this.isValid(boundary, fromX, fromY, fromZ)) {
                                    to = unit;
                                    from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
                                    network.addConnection(from, to);
                                }
                            }
                        }
                    }
                }
            }
        }
        return {
            width: (boundary.width - this.padding) / this.stride | 0,
            height: (boundary.height - this.padding) / this.stride | 0,
            depth: (boundary.depth - this.padding) / this.stride | 0,
            layer: this.layer
        };
    };
    // returns true if the coords are inside the boundara
    Convolution3D.prototype.isValid = function (boundary, x, y, z) {
        return x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height &&
            z > 0 &&
            z < boundary.depth;
    };
    return Convolution3D;
}());
exports.default = Convolution3D;
//# sourceMappingURL=Convolution3D.js.map