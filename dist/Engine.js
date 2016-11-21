"use strict";
(function (ActivationTypes) {
    ActivationTypes[ActivationTypes["LOGISTIC_SIGMOID"] = 0] = "LOGISTIC_SIGMOID";
    ActivationTypes[ActivationTypes["TANH"] = 1] = "TANH";
    ActivationTypes[ActivationTypes["RELU"] = 2] = "RELU";
    ActivationTypes[ActivationTypes["MAX_POOLING"] = 3] = "MAX_POOLING";
    ActivationTypes[ActivationTypes["DROPOUT"] = 4] = "DROPOUT";
    ActivationTypes[ActivationTypes["IDENTITY"] = 5] = "IDENTITY";
})(exports.ActivationTypes || (exports.ActivationTypes = {}));
var ActivationTypes = exports.ActivationTypes;
(function (StatusTypes) {
    StatusTypes[StatusTypes["IDLE"] = 0] = "IDLE";
    StatusTypes[StatusTypes["INIT"] = 1] = "INIT";
    StatusTypes[StatusTypes["REVERSE_INIT"] = 2] = "REVERSE_INIT";
    StatusTypes[StatusTypes["ACTIVATING"] = 3] = "ACTIVATING";
    StatusTypes[StatusTypes["PROPAGATING"] = 4] = "PROPAGATING";
    StatusTypes[StatusTypes["TRAINING"] = 5] = "TRAINING";
})(exports.StatusTypes || (exports.StatusTypes = {}));
var StatusTypes = exports.StatusTypes;
var defaults = {
    bias: true,
    generator: function () { return Math.random() * 2 - 1; }
};
var Engine = (function () {
    function Engine(_a) {
        var _b = _a === void 0 ? defaults : _a, bias = _b.bias, generator = _b.generator;
        this.state = {};
        this.weight = {};
        this.gain = {};
        this.activation = {};
        this.elegibilityTrace = {};
        this.extendedElegibilityTrace = {};
        this.errorResponsibility = {};
        this.projectedErrorResponsibility = {};
        this.gatedErrorResponsibility = {};
        this.activationFunction = {};
        this.inputsOf = {};
        this.projectedBy = {};
        this.gatersOf = {};
        this.gatedBy = {};
        this.inputsOfGatedBy = {};
        this.projectionSet = {};
        this.gateSet = {};
        this.inputSet = {};
        this.derivativeTerm = {};
        this.connections = [];
        this.gates = [];
        this.learningRate = 0.1;
        this.layers = [];
        this.size = 0;
        this.biasUnit = null;
        this.status = StatusTypes.IDLE;
        this.random = generator;
        this.status = StatusTypes.IDLE;
        if (bias) {
            this.biasUnit = this.addUnit();
            this.activation[this.biasUnit] = 1;
        }
    }
    Engine.prototype.addUnit = function (activationFunction) {
        if (activationFunction === void 0) { activationFunction = ActivationTypes.LOGISTIC_SIGMOID; }
        var unit = this.size;
        this.state[unit] = this.random();
        this.weight[unit] = {};
        this.gain[unit] = {};
        this.elegibilityTrace[unit] = {};
        this.extendedElegibilityTrace[unit] = {};
        this.activation[unit] = 0;
        this.weight[unit][unit] = 0;
        this.gain[unit][unit] = 1;
        this.elegibilityTrace[unit][unit] = 0;
        this.extendedElegibilityTrace[unit][unit] = {};
        this.activationFunction[unit] = activationFunction;
        this.errorResponsibility[unit] = 0;
        this.projectedErrorResponsibility[unit] = 0;
        this.gatedErrorResponsibility[unit] = 0;
        this.inputsOf[unit] = [];
        this.projectedBy[unit] = [];
        this.gatersOf[unit] = [];
        this.gatedBy[unit] = [];
        this.inputsOfGatedBy[unit] = {};
        this.derivativeTerm[unit] = {};
        this.inputSet[unit] = [];
        this.projectionSet[unit] = [];
        this.gateSet[unit] = [];
        this.size++;
        if (this.biasUnit != null) {
            this.addConnection(this.biasUnit, unit);
        }
        return unit;
    };
    Engine.prototype.addConnection = function (from, to, weight) {
        if (weight === void 0) { weight = null; }
        if (this.connections.some(function (connection) { return connection.from === from && connection.to === to; })) {
            return;
        }
        this.connections.push({ from: from, to: to });
        var j = to;
        var i = from;
        var isSelfConnection = (from === to);
        this.gain[j][i] = 1;
        this.weight[j][i] = isSelfConnection ? 1 : weight == null ? this.random() : weight;
        this.elegibilityTrace[j][i] = 0;
        this.extendedElegibilityTrace[j][i] = {};
        this.track(to);
        this.track(from);
    };
    Engine.prototype.addGate = function (from, to, gater) {
        var alreadyGated = this.gates.some(function (gate) { return gate.from === from && gate.to === to; });
        var isBias = from === this.biasUnit;
        if (alreadyGated || isBias) {
            return;
        }
        this.gates.push({ from: from, to: to, gater: gater });
        this.track(to);
        this.track(from);
        this.track(gater);
    };
    Engine.prototype.addLayer = function (size, activationFunction) {
        if (size === void 0) { size = 0; }
        if (this.status === StatusTypes.REVERSE_INIT) {
            throw new Error('You can\'t add layers during REVERSE_INIT phase!');
        }
        var layer = [];
        for (var i = 0; i < size; i++) {
            var unit = this.addUnit(activationFunction);
            layer.push(unit);
        }
        this.layers.push(layer);
        return layer;
    };
    Engine.prototype.track = function (unit) {
        var _this = this;
        this.inputsOf[unit] = uniq(this.connections
            .filter(function (connection) { return connection.to === unit; })
            .map(function (connection) { return connection.from; }));
        this.projectedBy[unit] = uniq(this.connections
            .filter(function (connection) { return connection.from === unit; })
            .map(function (connection) { return connection.to; }));
        this.gatersOf[unit] = uniq(this.gates
            .filter(function (gate) { return gate.to === unit; })
            .map(function (gate) { return gate.gater; }));
        this.gatedBy[unit] = uniq(this.gates
            .filter(function (gate) { return gate.gater === unit; })
            .map(function (gate) { return gate.to; }));
        this.inputsOf[unit].forEach(function (i) {
            _this.gatedBy[unit].forEach(function (k) {
                _this.extendedElegibilityTrace[unit][i][k] = 0;
            });
        });
        this.projectedBy[unit].forEach(function (j) {
            _this.gatedBy[j].forEach(function (k) {
                _this.extendedElegibilityTrace[j][unit][k] = 0;
            });
        });
        this.gatersOf[unit].forEach(function (j) {
            _this.inputsOf[j].forEach(function (i) {
                _this.extendedElegibilityTrace[j][i][unit] = 0;
            });
        });
        this.inputsOf[unit].forEach(function (i) {
            _this.gatersOf[unit].forEach(function (j) {
                _this.inputsOfGatedBy[unit][j] = uniq(_this.inputsOfGatedBy[unit][j], _this.gates
                    .filter(function (gate) { return gate.gater === j && gate.to === unit && gate.from === i; })
                    .map(function (gate) { return gate.from; }));
            });
        });
        this.gatedBy[unit].forEach(function (k) {
            _this.inputsOf[k].forEach(function (i) {
                _this.inputsOfGatedBy[k][unit] = uniq(_this.inputsOfGatedBy[k][unit], _this.gates
                    .filter(function (gate) { return gate.gater === unit && gate.to === k && gate.from === i; })
                    .map(function (gate) { return gate.from; }));
            });
        });
        this.gatedBy[unit].forEach(function (k) {
            _this.derivativeTerm[k][unit] = _this.gates
                .some(function (gate) { return gate.to === k && gate.from === k && gate.gater === unit; })
                ? 1
                : 0;
        });
        this.gatersOf[unit].forEach(function (j) {
            _this.derivativeTerm[unit][j] = _this.gates
                .some(function (gate) { return gate.to === unit && gate.from === unit && gate.gater === j; })
                ? 1
                : 0;
        });
        this.inputSet[unit] = this.inputsOf[unit].filter(function (input) { return input !== unit; });
        this.projectionSet[unit] = this.projectedBy[unit].filter(function (projected) { return projected > unit; });
        this.gateSet[unit] = this.gatedBy[unit].filter(function (gated) { return gated > unit; });
    };
    Engine.prototype.toJSON = function () {
        return JSON.stringify({
            state: this.state,
            weight: this.weight,
            gain: this.gain,
            activation: this.activation,
            elegibilityTrace: this.elegibilityTrace,
            extendedElegibilityTrace: this.extendedElegibilityTrace,
            errorResponsibility: this.errorResponsibility,
            projectedErrorResponsibility: this.projectedErrorResponsibility,
            gatedErrorResponsibility: this.gatedErrorResponsibility,
            activationFunction: this.activationFunction,
            inputsOf: this.inputsOf,
            projectedBy: this.projectedBy,
            gatersOf: this.gatersOf,
            gatedBy: this.gatedBy,
            inputsOfGatedBy: this.inputsOfGatedBy,
            projectionSet: this.projectionSet,
            gateSet: this.gateSet,
            inputSet: this.inputSet,
            derivativeTerm: this.derivativeTerm,
            connections: this.connections,
            gates: this.gates,
            learningRate: this.learningRate,
            layers: this.layers,
            size: this.size,
            biasUnit: this.biasUnit
        });
    };
    Engine.prototype.clone = function () {
        return Engine.fromJSON(this.toJSON());
    };
    Engine.fromJSON = function (json) {
        var data = JSON.parse(json);
        var engine = new Engine();
        Object.keys(data).forEach(function (key) { return engine[key] = data[key]; });
        return engine;
    };
    Engine.prototype.clear = function () {
    };
    return Engine;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Engine;
function uniq() {
    var arrays = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arrays[_i - 0] = arguments[_i];
    }
    var concated = arrays.reduce(function (concated, array) { return concated.concat(array || []); }, []);
    var o = {}, a = [], i;
    for (i = 0; i < concated.length; o[concated[i++]] = 1)
        ;
    for (i in o)
        a.push(+i);
    return a;
}
//# sourceMappingURL=Engine.js.map