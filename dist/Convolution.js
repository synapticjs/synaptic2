"use strict";
var Convolution = (function () {
    function Convolution(_a) {
        var _b = _a.filter, filter = _b === void 0 ? 1 : _b, _c = _a.height, height = _c === void 0 ? 1 : _c, _d = _a.depth, depth = _d === void 0 ? 1 : _d, _e = _a.stride, stride = _e === void 0 ? 1 : _e, _f = _a.padding, padding = _f === void 0 ? 0 : _f;
        this.filter = filter;
        this.height = height;
        this.depth = depth;
        this.stride = stride;
        this.padding = padding;
        this.layer = null;
    }
    Convolution.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'Convolution\' cannot be the first layer of the network!');
        }
        this.layer = network.addLayer();
        var x, y, z, fromX, fromY, fromZ, from, to;
        for (z = 0; z < this.depth; z++) {
            for (y = 0; y < this.height; y++) {
                for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {
                    var unit = network.addUnit();
                    this.layer.push(unit);
                    var filterRadious = this.filter / 2;
                    for (var offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
                        fromX = Math.round(x + offsetX);
                        for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
                            for (fromY = 0; fromY < boundary.height; fromY++) {
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
            height: this.height,
            depth: this.depth,
            layer: this.layer
        };
    };
    Convolution.prototype.isValid = function (boundary, x, y, z) {
        return x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height &&
            z > 0 &&
            z < boundary.depth;
    };
    return Convolution;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Convolution;
//# sourceMappingURL=Convolution.js.map