"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Engine_1 = require("./Engine");
var CPU_1 = require("./backends/CPU");
var Network = (function () {
    function Network() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        var layers;
        var options = args[0];
        if (hasOptions(options)) {
            if ('backend' in options) {
                this.backend = options.backend;
            }
            else if ('engine' in options) {
                this.backend = new CPU_1.default(options.engine);
            }
            else if ('bias' in options || 'generator' in options) {
                var engine = new Engine_1.default(options);
                this.backend = new CPU_1.default(engine);
            }
            layers = options.layers || [];
        }
        else {
            this.backend = new CPU_1.default();
            layers = args.slice();
        }
        this.engine = this.backend.engine;
        var prevBoundary = null;
        var nextBoundary = null;
        // init layers
        this.engine.status = Engine_1.StatusTypes.INIT;
        var boundaries = [];
        layers.forEach(function (layer) {
            prevBoundary = layer.init && layer.init(_this, prevBoundary) || prevBoundary;
            boundaries.push(prevBoundary);
        });
        // reverse init layers
        this.engine.status = Engine_1.StatusTypes.REVERSE_INIT;
        boundaries.reverse();
        layers.concat().reverse()
            .forEach(function (layer, index) {
            nextBoundary = boundaries[index - 1] || nextBoundary;
            layer.reverseInit && layer.reverseInit(_this, nextBoundary);
        });
        // done
        this.engine.status = Engine_1.StatusTypes.IDLE;
    }
    Network.prototype.addUnit = function (activationFunction) {
        return this.engine.addUnit(activationFunction);
    };
    Network.prototype.addConnection = function (from, to, weight) {
        if (weight === void 0) { weight = null; }
        return this.engine.addConnection(from, to, weight);
    };
    Network.prototype.addGate = function (from, to, gater) {
        return this.engine.addGate(from, to, gater);
    };
    Network.prototype.addLayer = function (width, height, depth) {
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 1; }
        if (depth === void 0) { depth = 1; }
        return this.engine.addLayer(width * height * depth);
    };
    Network.prototype.getLayers = function () {
        return this.engine.layers.slice(); // return a clone of the layers array
    };
    Network.prototype.toJSON = function () {
        return this.engine.toJSON();
    };
    Network.prototype.clone = function () {
        return Network.fromJSON(this.toJSON());
    };
    Network.prototype.activate = function (input) {
        return this.backend.activate(input);
    };
    Network.prototype.propagate = function (target) {
        this.backend.propagate(target);
    };
    Network.fromJSON = function (json) {
        var engine = Engine_1.default.fromJSON(json);
        return new Network({ engine: engine });
    };
    return Network;
}());
exports.default = Network;
// -- helper to figure out if the user passed options or just layers
function hasOptions(args) {
    return args && (args.layers || args.engine || args.backend || args.bias || args.generator) && !args[0];
}
//# sourceMappingURL=Network.js.map