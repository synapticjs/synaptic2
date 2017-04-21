"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this is based on this article: http://cs231n.github.io/convolutional-networks/
var Convolution2D = (function () {
    function Convolution2D(_a) {
        var _b = _a.filter, filter = _b === void 0 ? 1 : _b, _c = _a.depth, depth = _c === void 0 ? 1 : _c, _d = _a.stride, stride = _d === void 0 ? 1 : _d, _e = _a.padding, padding = _e === void 0 ? 0 : _e;
        this.filter = filter;
        this.depth = depth;
        this.stride = stride;
        this.padding = padding;
        this.layer = null;
    }
    Convolution2D.prototype.init = function (network, boundary) {
        if (boundary == null) {
            throw new Error('\'Convolution2D\' can\'t be the first layer of the network!');
        }
        this.layer = network.addLayer();
        var x, y, z, fromX, fromY, fromZ, from, to;
        for (z = 0; z < this.depth; z++) {
            for (y = this.padding; y < boundary.height - this.padding; y += this.stride) {
                for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {
                    // create convolution layer units
                    var unit = network.addUnit();
                    this.layer.push(unit);
                    // connect units to prev layer
                    var filterRadious = this.filter / 2;
                    for (var offsetY = -filterRadious; offsetY < filterRadious; offsetY++) {
                        for (var offsetX = -filterRadious; offsetX < filterRadious; offsetX++) {
                            fromX = Math.round(x + offsetX);
                            fromY = Math.round(y + offsetY);
                            for (fromZ = 0; fromZ < boundary.depth; fromZ++) {
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
            depth: this.depth,
            layer: this.layer
        };
    };
    // returns true if the coords fall within the layer area
    Convolution2D.prototype.isValid = function (boundary, x, y, z) {
        return x > 0 &&
            x < boundary.width &&
            y > 0 &&
            y < boundary.height &&
            z > 0 &&
            z < boundary.depth;
    };
    return Convolution2D;
}());
exports.default = Convolution2D;
//# sourceMappingURL=Convolution2D.js.map