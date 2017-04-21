// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// -- Activation Types
var ActivationTypes;
(function (ActivationTypes) {
    ActivationTypes[ActivationTypes["LOGISTIC_SIGMOID"] = 0] = "LOGISTIC_SIGMOID";
    ActivationTypes[ActivationTypes["TANH"] = 1] = "TANH";
    ActivationTypes[ActivationTypes["RELU"] = 2] = "RELU";
    ActivationTypes[ActivationTypes["MAX_POOLING"] = 3] = "MAX_POOLING";
    ActivationTypes[ActivationTypes["DROPOUT"] = 4] = "DROPOUT";
    ActivationTypes[ActivationTypes["IDENTITY"] = 5] = "IDENTITY";
})(ActivationTypes = exports.ActivationTypes || (exports.ActivationTypes = {}));
// -- Status Types
var StatusTypes;
(function (StatusTypes) {
    StatusTypes[StatusTypes["IDLE"] = 0] = "IDLE";
    StatusTypes[StatusTypes["INIT"] = 1] = "INIT";
    StatusTypes[StatusTypes["REVERSE_INIT"] = 2] = "REVERSE_INIT";
    StatusTypes[StatusTypes["ACTIVATING"] = 3] = "ACTIVATING";
    StatusTypes[StatusTypes["PROPAGATING"] = 4] = "PROPAGATING";
    StatusTypes[StatusTypes["TRAINING"] = 5] = "TRAINING";
})(StatusTypes = exports.StatusTypes || (exports.StatusTypes = {}));
// -- Engine
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
        // if using bias, create a bias unit, with a fixed activation of 1
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
        this.weight[unit][unit] = 0; // since it's not self-connected the weight of the self-connection is 0 (this is explained in the text between eq. 14 and eq. 15)
        this.gain[unit][unit] = 1; // ungated connections have a gain of 1 (eq. 14)
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
        // if using bias, connect bias unit to newly created unit
        if (this.biasUnit != null) {
            this.addConnection(this.biasUnit, unit);
        }
        return unit;
    };
    Engine.prototype.addConnection = function (from, to, weight) {
        if (weight === void 0) { weight = null; }
        // if the connection already exists then return
        if (this.connections.some(function (connection) { return connection.from === from && connection.to === to; })) {
            return;
        }
        // add the connection to the list
        this.connections.push({ from: from, to: to });
        // setup connection
        var j = to;
        var i = from;
        var isSelfConnection = (from === to);
        this.gain[j][i] = 1; // ungated connections have a gain of 1 (eq. 14)
        this.weight[j][i] = isSelfConnection ? 1 : weight == null ? this.random() : weight; // self-connections have a fixed weight of 1 (this is explained in the text between eq. 14 and eq. 15)
        this.elegibilityTrace[j][i] = 0;
        this.extendedElegibilityTrace[j][i] = {};
        // track units
        this.track(to);
        this.track(from);
    };
    Engine.prototype.addGate = function (from, to, gater) {
        // if the connection is already gated or is a bias connection then return
        var alreadyGated = this.gates.some(function (gate) { return gate.from === from && gate.to === to; });
        var isBias = from === this.biasUnit;
        if (alreadyGated || isBias) {
            return;
        }
        this.gates.push({ from: from, to: to, gater: gater });
        // track units
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
        // each unit keeps track of all the units that project a connection into it (aka inputs)
        this.inputsOf[unit] = uniq(this.connections
            .filter(function (connection) { return connection.to === unit; })
            .map(function (connection) { return connection.from; }));
        // each unit keeps track of all the units that receive a connection from them (aka projections)
        this.projectedBy[unit] = uniq(this.connections
            .filter(function (connection) { return connection.from === unit; })
            .map(function (connection) { return connection.to; }));
        // each unit keeps track of all the other units gating connections into it
        this.gatersOf[unit] = uniq(this.gates
            .filter(function (gate) { return gate.to === unit; })
            .map(function (gate) { return gate.gater; }));
        // each unit keeps track of all the units that receive connections gated by them
        this.gatedBy[unit] = uniq(this.gates
            .filter(function (gate) { return gate.gater === unit; })
            .map(function (gate) { return gate.to; }));
        /* According to eq. 18:
          If unit j gates connections into other units k, it must maintain a set of
          extended eligibility traces for each such k. A trace of this type captures
          the efect that the connection from i potentially has on the state of k
          through its influence on j
        */
        // track extended elegibility traces for j
        this.inputsOf[unit].forEach(function (i) {
            _this.gatedBy[unit].forEach(function (k) {
                _this.extendedElegibilityTrace[unit][i][k] = 0;
            });
        });
        // track extended elegibility traces for i
        this.projectedBy[unit].forEach(function (j) {
            _this.gatedBy[j].forEach(function (k) {
                _this.extendedElegibilityTrace[j][unit][k] = 0;
            });
        });
        // track extended elegibility traces for k
        this.gatersOf[unit].forEach(function (j) {
            _this.inputsOf[j].forEach(function (i) {
                _this.extendedElegibilityTrace[j][i][unit] = 0;
            });
        });
        /*
          also, in order to compute the Big Parenthesis Term (eq. 18 and eq. 22)
          each unit must track an index that runs over all the units whose
          connections to k are gated by j
        */
        // track inputs of unit gated by j
        this.inputsOf[unit].forEach(function (i) {
            _this.gatersOf[unit].forEach(function (j) {
                _this.inputsOfGatedBy[unit][j] = uniq(_this.inputsOfGatedBy[unit][j], _this.gates
                    .filter(function (gate) { return gate.gater === j && gate.to === unit && gate.from === i; })
                    .map(function (gate) { return gate.from; }));
            });
        });
        // track inputs of k gated by unit
        this.gatedBy[unit].forEach(function (k) {
            _this.inputsOf[k].forEach(function (i) {
                _this.inputsOfGatedBy[k][unit] = uniq(_this.inputsOfGatedBy[k][unit], _this.gates
                    .filter(function (gate) { return gate.gater === unit && gate.to === k && gate.from === i; })
                    .map(function (gate) { return gate.from; }));
            });
        });
        /*
          also, in order to compute the Big Parenthesis Term
          each unit must track of a derivative term that can
          be 1 if and only if j gates k's self-connection,
          otherwise it is 0
        */
        // compute derivative term for k gated by unit
        this.gatedBy[unit].forEach(function (k) {
            _this.derivativeTerm[k][unit] = _this.gates
                .some(function (gate) { return gate.to === k && gate.from === k && gate.gater === unit; })
                ? 1
                : 0;
        });
        // compute derivative term for unit gated by j
        this.gatersOf[unit].forEach(function (j) {
            _this.derivativeTerm[unit][j] = _this.gates
                .some(function (gate) { return gate.to === unit && gate.from === unit && gate.gater === j; })
                ? 1
                : 0;
        });
        // each unit keeps track of all the other units that project a connection into them, and that are not self-connections (see eq. 4)
        this.inputSet[unit] = this.inputsOf[unit].filter(function (input) { return input !== unit; });
        // each unit keeps track of all the other units that they project connections into, and that are downstream of them (see eq. 19)
        this.projectionSet[unit] = this.projectedBy[unit].filter(function (projected) { return projected > unit; });
        // each unit keeps track of all the units that they are gating a connection into, and that are downstream of them (see eq. 20)
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
        var data = typeof json === 'string' ? JSON.parse(json) : json;
        var engine = new Engine();
        Object.keys(data).forEach(function (key) { return engine[key] = data[key]; });
        return engine;
    };
    Engine.prototype.clear = function () {
        // TODO: this should wipe all the elegibilityTrace's and extendedElegibilityTrace's to clear the networks context
    };
    return Engine;
}());
exports.default = Engine;
// helper for removing duplicated ints from an array
function uniq() {
    var arrays = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arrays[_i] = arguments[_i];
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