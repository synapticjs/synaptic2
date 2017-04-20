(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["synaptic"] = factory();
	else
		root["synaptic"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	// core
	var Engine_1 = __webpack_require__(1);
	exports.Engine = Engine_1.default;
	var Network_1 = __webpack_require__(2);
	exports.Network = Network_1.default;
	var Trainer_1 = __webpack_require__(4);
	exports.Trainer = Trainer_1.default;
	// backends
	var ASM_1 = __webpack_require__(5);
	var BLAS_1 = __webpack_require__(6);
	var CPU_1 = __webpack_require__(3);
	var GPU_1 = __webpack_require__(7);
	var Paper_1 = __webpack_require__(8);
	var WebWorker_1 = __webpack_require__(9);
	var backends = {
	    ASM: ASM_1.default,
	    BLAS: BLAS_1.default,
	    CPU: CPU_1.default,
	    GPU: GPU_1.default,
	    Paper: Paper_1.default,
	    WebWorker: WebWorker_1.default
	};
	exports.backends = backends;
	// layers
	var Activation = __webpack_require__(10);
	var Convolution_1 = __webpack_require__(11);
	var Convolution2D_1 = __webpack_require__(12);
	var Convolution3D_1 = __webpack_require__(13);
	var Dense_1 = __webpack_require__(14);
	var Dropout_1 = __webpack_require__(15);
	var Input_1 = __webpack_require__(16);
	var Input2D_1 = __webpack_require__(17);
	var Input3D_1 = __webpack_require__(18);
	var InputToOutput_1 = __webpack_require__(19);
	var LSTM_1 = __webpack_require__(20);
	var MaxPool_1 = __webpack_require__(21);
	var MaxPool2D_1 = __webpack_require__(22);
	var MaxPool3D_1 = __webpack_require__(23);
	var ZeroPadding_1 = __webpack_require__(24);
	var ZeroPadding2D_1 = __webpack_require__(25);
	var ZeroPadding3D_1 = __webpack_require__(26);
	var layers = {
	    Activation: Activation,
	    Convolution: Convolution_1.default,
	    Convolution2D: Convolution2D_1.default,
	    Convolution3D: Convolution3D_1.default,
	    Dense: Dense_1.default,
	    Dropout: Dropout_1.default,
	    Input: Input_1.default,
	    Input2D: Input2D_1.default,
	    Input3D: Input3D_1.default,
	    InputToOutput: InputToOutput_1.default,
	    LSTM: LSTM_1.default,
	    MaxPool: MaxPool_1.default,
	    MaxPool2D: MaxPool2D_1.default,
	    MaxPool3D: MaxPool3D_1.default,
	    ZeroPadding: ZeroPadding_1.default,
	    ZeroPadding2D: ZeroPadding2D_1.default,
	    ZeroPadding3D: ZeroPadding3D_1.default
	};
	exports.layers = layers;


/***/ },
/* 1 */
/***/ function(module, exports) {

	// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
	// trying to keep the code as close as posible to the equations and as verbose as possible.
	"use strict";
	// -- Activation Types
	(function (ActivationTypes) {
	    ActivationTypes[ActivationTypes["LOGISTIC_SIGMOID"] = 0] = "LOGISTIC_SIGMOID";
	    ActivationTypes[ActivationTypes["TANH"] = 1] = "TANH";
	    ActivationTypes[ActivationTypes["RELU"] = 2] = "RELU";
	    ActivationTypes[ActivationTypes["MAX_POOLING"] = 3] = "MAX_POOLING";
	    ActivationTypes[ActivationTypes["DROPOUT"] = 4] = "DROPOUT";
	    ActivationTypes[ActivationTypes["IDENTITY"] = 5] = "IDENTITY";
	})(exports.ActivationTypes || (exports.ActivationTypes = {}));
	var ActivationTypes = exports.ActivationTypes;
	// -- Status Types
	(function (StatusTypes) {
	    StatusTypes[StatusTypes["IDLE"] = 0] = "IDLE";
	    StatusTypes[StatusTypes["INIT"] = 1] = "INIT";
	    StatusTypes[StatusTypes["REVERSE_INIT"] = 2] = "REVERSE_INIT";
	    StatusTypes[StatusTypes["ACTIVATING"] = 3] = "ACTIVATING";
	    StatusTypes[StatusTypes["PROPAGATING"] = 4] = "PROPAGATING";
	    StatusTypes[StatusTypes["TRAINING"] = 5] = "TRAINING";
	})(exports.StatusTypes || (exports.StatusTypes = {}));
	var StatusTypes = exports.StatusTypes;
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Engine;
	// helper for removing duplicated ints from an array
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var CPU_1 = __webpack_require__(3);
	var Network = (function () {
	    function Network() {
	        var _this = this;
	        var args = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            args[_i - 0] = arguments[_i];
	        }
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Network;
	// -- helper to figure out if the user passed options or just layers
	function hasOptions(args) {
	    return args && (args.layers || args.engine || args.backend || args.bias || args.generator) && !args[0];
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
	// trying to keep the code as close as posible to the equations and as verbose as possible.
	"use strict";
	var Engine_1 = __webpack_require__(1);
	var Trainer_1 = __webpack_require__(4);
	var CPU = (function () {
	    function CPU(engine) {
	        if (engine === void 0) { engine = new Engine_1.default(); }
	        this.engine = engine;
	        this.activateUnit = this.activateUnit.bind(this);
	        this.propagateUnit = this.propagateUnit.bind(this);
	        this.activate = this.activate.bind(this);
	        this.propagate = this.propagate.bind(this);
	        this.bigParenthesisTerm = this.bigParenthesisTerm.bind(this);
	        this.activationFunction = this.activationFunction.bind(this);
	        this.activationFunctionDerivative = this.activationFunctionDerivative.bind(this);
	        this.costFunction = this.costFunction.bind(this);
	        this.train = this.train.bind(this);
	    }
	    CPU.prototype.activateUnit = function (j, input) {
	        if (typeof input !== 'undefined') {
	            this.engine.activation[j] = input;
	        }
	        else {
	            var i = void 0, k = void 0, h = void 0, g = void 0, to = void 0, from = void 0;
	            this.engine.state[j] *= this.engine.gain[j][j] * this.engine.weight[j][j];
	            for (h = 0; h < this.engine.inputSet[j].length; h++) {
	                i = this.engine.inputSet[j][h];
	                this.engine.state[j] += this.engine.gain[j][i] * this.engine.weight[j][i] * this.engine.activation[i];
	            }
	            this.engine.activation[j] = this.activationFunction(j);
	            for (h = 0; h < this.engine.inputSet[j].length; h++) {
	                i = this.engine.inputSet[j][h];
	                this.engine.elegibilityTrace[j][i] = this.engine.gain[j][j] * this.engine.weight[j][j] * this.engine.elegibilityTrace[j][i] + this.engine.gain[j][i] * this.engine.activation[i];
	                for (g = 0; g < this.engine.gatedBy[j].length; g++) {
	                    k = this.engine.gatedBy[j][g];
	                    this.engine.extendedElegibilityTrace[j][i][k] = this.engine.gain[k][k] * this.engine.weight[k][k] * this.engine.extendedElegibilityTrace[j][i][k] + this.activationFunctionDerivative(j) * this.engine.elegibilityTrace[j][i] * this.bigParenthesisTerm(k, j);
	                }
	            }
	            for (h = 0; h < this.engine.gatedBy[j].length; h++) {
	                to = this.engine.gatedBy[j][h];
	                for (g = 0; g < this.engine.inputsOfGatedBy[to][j].length; g++) {
	                    from = this.engine.inputsOfGatedBy[to][j][g];
	                    this.engine.gain[to][from] = this.engine.activation[j];
	                }
	            }
	        }
	        return this.engine.activation[j];
	    };
	    CPU.prototype.propagateUnit = function (j, target) {
	        var i, k, h, g;
	        if (typeof target !== 'undefined') {
	            this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] = target - this.engine.activation[j];
	        }
	        else {
	            this.engine.projectedErrorResponsibility[j] = 0;
	            for (h = 0; h < this.engine.projectionSet[j].length; h++) {
	                k = this.engine.projectionSet[j][h];
	                this.engine.projectedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.engine.gain[k][j] * this.engine.weight[k][j];
	            }
	            this.engine.projectedErrorResponsibility[j] *= this.activationFunctionDerivative(j);
	            this.engine.gatedErrorResponsibility[j] = 0;
	            for (h = 0; h < this.engine.gateSet[j].length; h++) {
	                k = this.engine.gateSet[j][h];
	                this.engine.gatedErrorResponsibility[j] += this.engine.errorResponsibility[k] * this.bigParenthesisTerm(k, j);
	            }
	            this.engine.gatedErrorResponsibility[j] *= this.activationFunctionDerivative(j);
	            this.engine.errorResponsibility[j] = this.engine.projectedErrorResponsibility[j] + this.engine.gatedErrorResponsibility[j];
	        }
	        for (h = 0; h < this.engine.inputSet[j].length; h++) {
	            i = this.engine.inputSet[j][h];
	            var Δw = this.engine.projectedErrorResponsibility[j] * this.engine.elegibilityTrace[j][i];
	            for (g = 0; g < this.engine.gateSet[j].length; g++) {
	                k = this.engine.gateSet[j][g];
	                Δw += this.engine.errorResponsibility[k] * this.engine.extendedElegibilityTrace[j][i][k];
	            }
	            Δw *= this.engine.learningRate;
	            this.engine.weight[j][i] += Δw;
	        }
	    };
	    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
	    CPU.prototype.bigParenthesisTerm = function (k, j) {
	        var result = this.engine.derivativeTerm[k][j] * this.engine.weight[k][k] * this.engine.state[k];
	        for (var i = 0; i < this.engine.inputsOfGatedBy[k][j].length; i++) {
	            var a = this.engine.inputsOfGatedBy[k][j][i];
	            if (a !== k) {
	                result += this.engine.weight[k][a] * this.engine.activation[a];
	            }
	        }
	        return result;
	    };
	    CPU.prototype.activationFunction = function (unit) {
	        var _this = this;
	        var x;
	        var type = this.engine.activationFunction[unit];
	        switch (type) {
	            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
	                x = this.engine.state[unit];
	                return 1 / (1 + Math.exp(-x));
	            case Engine_1.ActivationTypes.TANH:
	                x = this.engine.state[unit];
	                var eP = Math.exp(x);
	                var eN = 1 / eP;
	                return (eP - eN) / (eP + eN);
	            case Engine_1.ActivationTypes.RELU:
	                x = this.engine.state[unit];
	                return x > 0 ? x : 0;
	            case Engine_1.ActivationTypes.IDENTITY:
	                x = this.engine.state[unit];
	                return x;
	            case Engine_1.ActivationTypes.MAX_POOLING:
	                var inputUnit = this.engine.inputsOf[unit][0];
	                var gatedUnit = this.engine.gatedBy[unit][0];
	                var inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit];
	                var maxActivation_1 = inputsOfGatedUnit.reduce(function (max, input) { return Math.max(_this.engine.activation[input], max); }, -Infinity);
	                var inputUnitWithHigherActivation = inputsOfGatedUnit.find(function (input) { return _this.engine.activation[input] === maxActivation_1; });
	                return inputUnitWithHigherActivation === inputUnit ? 1 : 0;
	            case Engine_1.ActivationTypes.DROPOUT:
	                var chances = this.engine.state[unit];
	                return this.engine.random() < chances && this.engine.status === Engine_1.StatusTypes.TRAINING ? 0 : 1;
	        }
	    };
	    CPU.prototype.activationFunctionDerivative = function (unit) {
	        var x;
	        var type = this.engine.activationFunction[unit];
	        switch (type) {
	            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
	                x = this.activationFunction(unit);
	                return x * (1 - x);
	            case Engine_1.ActivationTypes.TANH:
	                x = this.activationFunction(unit);
	                return 1 - Math.pow(x, 2);
	            case Engine_1.ActivationTypes.RELU:
	                return 0;
	            case Engine_1.ActivationTypes.IDENTITY:
	                return 0;
	            case Engine_1.ActivationTypes.MAX_POOLING:
	                return 0;
	            case Engine_1.ActivationTypes.DROPOUT:
	                return 0;
	        }
	    };
	    CPU.prototype.costFunction = function (target, predicted, costType) {
	        var i, x = 0;
	        switch (costType) {
	            case Trainer_1.CostTypes.MSE:
	                for (i = 0; i < target.length; i++) {
	                    x += Math.pow(target[i] - predicted[i], 2);
	                }
	                return x / target.length;
	            case Trainer_1.CostTypes.CROSS_ENTROPY:
	                for (i = 0; i < target.length; i++) {
	                    x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i])); // +1e-15 is a tiny push away to avoid Math.log(0)
	                }
	                return x;
	            case Trainer_1.CostTypes.BINARY:
	                for (i = 0; i < target.length; i++) {
	                    x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
	                }
	                return x;
	        }
	    };
	    CPU.prototype.activate = function (inputs) {
	        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
	        var activation = [];
	        var outputLayerIndex = this.engine.layers.length - 1;
	        for (var i = 0; i < this.engine.layers.length; i++) {
	            for (var j = 0; j < this.engine.layers[i].length; j++) {
	                switch (i) {
	                    case 0:
	                        this.activateUnit(this.engine.layers[i][j], inputs[j]);
	                        break;
	                    case outputLayerIndex:
	                        activation.push(this.activateUnit(this.engine.layers[i][j]));
	                        break;
	                    default:
	                        this.activateUnit(this.engine.layers[i][j]);
	                }
	            }
	        }
	        this.engine.status = Engine_1.StatusTypes.IDLE;
	        return activation;
	    };
	    CPU.prototype.propagate = function (targets) {
	        this.engine.status = Engine_1.StatusTypes.PROPAGATING;
	        var outputLayerIndex = this.engine.layers.length - 1;
	        for (var j = this.engine.layers[outputLayerIndex].length - 1; j >= 0; j--) {
	            this.propagateUnit(this.engine.layers[outputLayerIndex][j], targets[j]);
	        }
	        for (var i = this.engine.layers.length - 2; i > 0; i--) {
	            for (var j = this.engine.layers[i].length - 1; j >= 0; j--) {
	                this.propagateUnit(this.engine.layers[i][j]);
	            }
	        }
	        this.engine.status = Engine_1.StatusTypes.IDLE;
	    };
	    CPU.prototype.train = function (dataset, _a) {
	        var _this = this;
	        var learningRate = _a.learningRate, minError = _a.minError, maxIterations = _a.maxIterations, costFunction = _a.costFunction;
	        return new Promise(function (resolve) {
	            // start training
	            var startTime = new Date().getTime();
	            var error = Infinity;
	            var iterations = 0;
	            _this.engine.learningRate = learningRate;
	            _this.engine.status = Engine_1.StatusTypes.TRAINING;
	            // train
	            while (error > minError && iterations < maxIterations) {
	                error = 0;
	                for (var index = 0; index < dataset.length; index++) {
	                    var _a = dataset[index], input = _a.input, output = _a.output;
	                    var predictedOutput = _this.activate(input);
	                    _this.propagate(output);
	                    error += _this.costFunction(output, predictedOutput, costFunction);
	                }
	                error /= dataset.length;
	                iterations++;
	            }
	            // end training
	            _this.engine.status = Engine_1.StatusTypes.IDLE;
	            resolve({
	                error: error,
	                iterations: iterations,
	                time: new Date().getTime() - startTime
	            });
	        });
	    };
	    return CPU;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = CPU;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	// -- Cost Types
	(function (CostTypes) {
	    CostTypes[CostTypes["MSE"] = 0] = "MSE";
	    CostTypes[CostTypes["CROSS_ENTROPY"] = 1] = "CROSS_ENTROPY";
	    CostTypes[CostTypes["BINARY"] = 2] = "BINARY";
	})(exports.CostTypes || (exports.CostTypes = {}));
	var CostTypes = exports.CostTypes;
	// -- Trainer
	var Trainer = (function () {
	    function Trainer(network) {
	        this.network = network;
	    }
	    Trainer.prototype.train = function (dataset, _a) {
	        var _b = _a === void 0 ? {} : _a, learningRate = _b.learningRate, minError = _b.minError, maxIterations = _b.maxIterations, costFunction = _b.costFunction;
	        return this.network.backend.train(dataset, {
	            learningRate: learningRate || 0.3,
	            minError: minError || 0.0005,
	            maxIterations: maxIterations || 5000,
	            costFunction: costFunction || CostTypes.MSE
	        });
	    };
	    Trainer.prototype.test = function (dataset, options) {
	        // TODO
	    };
	    return Trainer;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Trainer;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = {};


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = {};


/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = {};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
	// trying to keep the code as close as posible to the equations and as verbose as possible.
	"use strict";
	var Engine_1 = __webpack_require__(1);
	var Trainer_1 = __webpack_require__(4);
	var Paper = (function () {
	    function Paper(engine) {
	        if (engine === void 0) { engine = new Engine_1.default(); }
	        this.engine = engine;
	        this.activateUnit = this.activateUnit.bind(this);
	        this.propagateUnit = this.propagateUnit.bind(this);
	        this.activate = this.activate.bind(this);
	        this.propagate = this.propagate.bind(this);
	        this.bigParenthesisTerm = this.bigParenthesisTerm.bind(this);
	        this.activationFunction = this.activationFunction.bind(this);
	        this.activationFunctionDerivative = this.activationFunctionDerivative.bind(this);
	        this.costFunction = this.costFunction.bind(this);
	        this.train = this.train.bind(this);
	    }
	    Paper.prototype.activateUnit = function (unit, input) {
	        // glosary
	        var j = unit;
	        var s = this.engine.state;
	        var w = this.engine.weight;
	        var g = this.engine.gain;
	        var y = this.engine.activation;
	        var f = this.activationFunction;
	        var df = this.activationFunctionDerivative;
	        var ε = this.engine.elegibilityTrace;
	        var xε = this.engine.extendedElegibilityTrace;
	        // unit sets
	        var inputSet = this.engine.inputSet;
	        var gatedBy = this.engine.gatedBy;
	        var inputsOfGatedBy = this.engine.inputsOfGatedBy;
	        // this is only for input neurons (they receive their activation from the environment)
	        if (typeof input !== 'undefined') {
	            y[j] = input;
	        }
	        else {
	            // eq. 15
	            s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], function (i) { return g[j][i] * w[j][i] * y[i]; }); // compute state of j
	            // eq. 16
	            y[j] = f(j); // compute activation of j
	            for (var _i = 0, _a = inputSet[j]; _i < _a.length; _i++) {
	                var i = _a[_i];
	                // eq. 17
	                ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i];
	                for (var _b = 0, _c = gatedBy[j]; _b < _c.length; _b++) {
	                    var k = _c[_b];
	                    // eq. 18
	                    xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j);
	                }
	            }
	            // update the gain of the connections gated by this unit with its activation value
	            for (var _d = 0, _e = gatedBy[unit]; _d < _e.length; _d++) {
	                var to = _e[_d];
	                for (var _f = 0, _g = inputsOfGatedBy[to][unit]; _f < _g.length; _f++) {
	                    var from = _g[_f];
	                    // eq. 14
	                    g[to][from] = y[unit];
	                }
	            }
	        }
	        // return the activation of this unit
	        return y[j];
	    };
	    Paper.prototype.propagateUnit = function (unit, target) {
	        var _this = this;
	        // glosary
	        var j = unit;
	        var s = this.engine.state;
	        var w = this.engine.weight;
	        var g = this.engine.gain;
	        var y = this.engine.activation;
	        var df = this.activationFunctionDerivative;
	        var δ = this.engine.errorResponsibility;
	        var δP = this.engine.projectedErrorResponsibility;
	        var δG = this.engine.gatedErrorResponsibility;
	        var α = this.engine.learningRate;
	        var ε = this.engine.elegibilityTrace;
	        var xε = this.engine.extendedElegibilityTrace;
	        var P = this.engine.projectionSet;
	        var G = this.engine.gateSet;
	        // unit sets
	        var inputSet = this.engine.inputSet;
	        // step 1: compute error responsibiltity (δ) for j
	        if (typeof target !== 'undefined') {
	            // eq. 10
	            δ[j] = δP[j] = target - y[j];
	        }
	        else {
	            // eq. 21
	            δP[j] = df(j) * Σ(P[j], function (k) { return δ[k] * g[k][j] * w[k][j]; });
	            // eq. 22
	            δG[j] = df(j) * Σ(G[j], function (k) { return δ[k] * _this.bigParenthesisTerm(k, j); });
	            // eq. 23
	            δ[j] = δP[j] + δG[j];
	        }
	        // step 2: compute deltas (Δw) and adjust the weights for all the inputs of j
	        var _loop_1 = function(i) {
	            // eq. 24
	            var Δw = α * δP[j] * ε[j][i] + α * Σ(G[j], function (k) { return δ[k] * xε[j][i][k]; });
	            // adjust the weights using delta
	            w[j][i] += Δw;
	        };
	        for (var _i = 0, _a = inputSet[j]; _i < _a.length; _i++) {
	            var i = _a[_i];
	            _loop_1(i);
	        }
	    };
	    /** this calculate the big parenthesis term that is present in eq. 18 and eq. 22 */
	    Paper.prototype.bigParenthesisTerm = function (k, j) {
	        // glosary
	        var w = this.engine.weight;
	        var s = this.engine.state;
	        var y = this.engine.activation;
	        var dt = this.engine.derivativeTerm[k][j]; // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
	        var units = this.engine.inputsOfGatedBy[k][j]; // this index runs over all the inputs of k, that are gated by j
	        // big parenthesis term
	        return dt * w[k][k] * s[k] + Σ(units.filter(function (a) { return a !== k; }), function (a) { return w[k][a] * y[a]; });
	    };
	    Paper.prototype.activationFunction = function (unit) {
	        var _this = this;
	        var x;
	        var type = this.engine.activationFunction[unit];
	        switch (type) {
	            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
	                x = this.engine.state[unit];
	                return 1 / (1 + Math.exp(-x));
	            case Engine_1.ActivationTypes.TANH:
	                x = this.engine.state[unit];
	                var eP = Math.exp(x);
	                var eN = 1 / eP;
	                return (eP - eN) / (eP + eN);
	            case Engine_1.ActivationTypes.RELU:
	                x = this.engine.state[unit];
	                return x > 0 ? x : 0;
	            case Engine_1.ActivationTypes.IDENTITY:
	                x = this.engine.state[unit];
	                return x;
	            case Engine_1.ActivationTypes.MAX_POOLING:
	                var inputUnit = this.engine.inputsOf[unit][0];
	                var gatedUnit = this.engine.gatedBy[unit][0];
	                var inputsOfGatedUnit = this.engine.inputsOfGatedBy[gatedUnit][unit];
	                var maxActivation_1 = inputsOfGatedUnit.reduce(function (max, input) { return Math.max(_this.engine.activation[input], max); }, -Infinity);
	                var inputUnitWithHigherActivation = inputsOfGatedUnit.find(function (input) { return _this.engine.activation[input] === maxActivation_1; });
	                return inputUnitWithHigherActivation === inputUnit ? 1 : 0;
	            case Engine_1.ActivationTypes.DROPOUT:
	                var chances = this.engine.state[unit];
	                return this.engine.random() < chances && this.engine.status === Engine_1.StatusTypes.TRAINING ? 0 : 1;
	        }
	    };
	    Paper.prototype.activationFunctionDerivative = function (unit) {
	        var x;
	        var type = this.engine.activationFunction[unit];
	        switch (type) {
	            case Engine_1.ActivationTypes.LOGISTIC_SIGMOID:
	                x = this.activationFunction(unit);
	                return x * (1 - x);
	            case Engine_1.ActivationTypes.TANH:
	                x = this.activationFunction(unit);
	                return 1 - Math.pow(x, 2);
	            case Engine_1.ActivationTypes.RELU:
	                return 0;
	            case Engine_1.ActivationTypes.IDENTITY:
	                return 0;
	            case Engine_1.ActivationTypes.MAX_POOLING:
	                return 0;
	            case Engine_1.ActivationTypes.DROPOUT:
	                return 0;
	        }
	    };
	    Paper.prototype.costFunction = function (target, predicted, costType) {
	        var i, x = 0;
	        switch (costType) {
	            case Trainer_1.CostTypes.MSE:
	                for (i = 0; i < target.length; i++) {
	                    x += Math.pow(target[i] - predicted[i], 2);
	                }
	                return x / target.length;
	            case Trainer_1.CostTypes.CROSS_ENTROPY:
	                for (i = 0; i < target.length; i++) {
	                    x -= (target[i] * Math.log(predicted[i] + 1e-15)) + ((1 - target[i]) * Math.log((1 + 1e-15) - predicted[i])); // +1e-15 is a tiny push away to avoid Math.log(0)
	                }
	                return x;
	            case Trainer_1.CostTypes.BINARY:
	                for (i = 0; i < target.length; i++) {
	                    x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2) ? 1 : 0;
	                }
	                return x;
	        }
	    };
	    Paper.prototype.activate = function (inputs) {
	        var _this = this;
	        this.engine.status = Engine_1.StatusTypes.ACTIVATING;
	        var activations = this.engine.layers.map(function (layer, layerIndex) {
	            return layer.map(function (unit, unitIndex) {
	                var input = layerIndex === 0 ? inputs[unitIndex] : void 0; // only units in the input layer receive an input
	                return _this.activateUnit(unit, input);
	            });
	        });
	        this.engine.status = Engine_1.StatusTypes.IDLE;
	        return activations.pop(); // return activation of the last layer (aka output layer)
	    };
	    Paper.prototype.propagate = function (targets) {
	        var _this = this;
	        this.engine.status = Engine_1.StatusTypes.PROPAGATING;
	        this.engine.layers
	            .slice(1) // input layer doesn't propagate
	            .reverse() // layers propagate in reverse order
	            .forEach(function (layer, layerIndex) {
	            layer
	                .slice()
	                .reverse() // units get propagated in reverse order
	                .forEach(function (unit, unitIndex) {
	                var target = layerIndex === 0 ? targets[unitIndex] : void 0; // only units in the output layer receive a target
	                _this.propagateUnit(unit, target);
	            });
	        });
	        this.engine.status = Engine_1.StatusTypes.IDLE;
	    };
	    Paper.prototype.train = function (dataset, _a) {
	        var _this = this;
	        var learningRate = _a.learningRate, minError = _a.minError, maxIterations = _a.maxIterations, costFunction = _a.costFunction;
	        return new Promise(function (resolve) {
	            // start training
	            var startTime = new Date().getTime();
	            var error = Infinity;
	            var iterations = 0;
	            _this.engine.learningRate = learningRate;
	            _this.engine.status = Engine_1.StatusTypes.TRAINING;
	            // train
	            while (error > minError && iterations < maxIterations) {
	                error = 0;
	                for (var _i = 0, dataset_1 = dataset; _i < dataset_1.length; _i++) {
	                    var data = dataset_1[_i];
	                    var input = data.input, output = data.output;
	                    var predictedOutput = _this.activate(input);
	                    _this.propagate(output);
	                    error += _this.costFunction(output, predictedOutput, costFunction);
	                }
	                error /= dataset.length;
	                iterations++;
	            }
	            // end training
	            _this.engine.status = Engine_1.StatusTypes.IDLE;
	            resolve({
	                error: error,
	                iterations: iterations,
	                time: new Date().getTime() - startTime
	            });
	        });
	    };
	    return Paper;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Paper;
	// --
	// helper for doing summations
	function Σ(indexes, fn) {
	    return indexes.reduce(function (sum, value) { return sum + fn(value); }, 0);
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = {};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var ReLU = (function () {
	    function ReLU() {
	        this.layer = null;
	    }
	    ReLU.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'Activation.ReLU\' can\'t be the first layer of the network!');
	        }
	        var prevLayer = boundary.layer;
	        this.layer = network.addLayer(prevLayer.length, Engine_1.ActivationTypes.RELU);
	        for (var i = 0; i < prevLayer.length; i++) {
	            network.addConnection(prevLayer[i], this.layer[i], 1);
	        }
	        // this layer doesn't change the boundary's dimensions
	        return {
	            width: boundary.width,
	            height: boundary.height,
	            depth: boundary.depth,
	            layer: this.layer
	        };
	    };
	    return ReLU;
	}());
	exports.ReLU = ReLU;


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	// this is based on this article: http://cs231n.github.io/convolutional-networks/
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
	            throw new Error('\'Convolution\' can\'t be the first layer of the network!');
	        }
	        this.layer = network.addLayer();
	        var x, y, z, fromX, fromY, fromZ, from, to;
	        for (z = 0; z < this.depth; z++) {
	            for (y = 0; y < this.height; y++) {
	                for (x = this.padding; x < boundary.width - this.padding; x += this.stride) {
	                    // create convolution layer units
	                    var unit = network.addUnit();
	                    this.layer.push(unit);
	                    // connect units to prev layer
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
	    // returns true if the coords fall within the layer area
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


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Convolution2D;


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Convolution3D;


/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	var Dense = (function () {
	    function Dense(size) {
	        this.size = size;
	    }
	    Dense.prototype.init = function (network, boundary) {
	        var _this = this;
	        if (boundary == null) {
	            throw new Error('\'Dense\' can\'t be the first layer of the network!');
	        }
	        this.layer = network.addLayer(this.size);
	        // connect all units from previous layer to this one
	        boundary.layer.forEach(function (from) {
	            _this.layer.forEach(function (to) {
	                network.addConnection(from, to);
	            });
	        });
	        // set the boundary for next layer
	        return {
	            width: this.size,
	            height: 1,
	            depth: 1,
	            layer: this.layer
	        };
	    };
	    return Dense;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Dense;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var Dropout = (function () {
	    function Dropout(chances) {
	        this.chances = chances;
	        this.gater = null;
	        this.layer = null;
	    }
	    Dropout.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'Dropout\' can\'t be the first layer of the network!');
	        }
	        this.gater = network.addLayer();
	        this.layer = network.addLayer();
	        var unit, from, to, gate;
	        for (var i = 0; i < boundary.layer.length; i++) {
	            unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	            this.layer.push(unit);
	            from = boundary.layer[i];
	            to = unit;
	            // add a connection with a fixed weight of 1
	            network.addConnection(from, to, 1);
	            // this unit will act as a gate, randomly dropping inputs
	            var gate_1 = network.addUnit(Engine_1.ActivationTypes.DROPOUT);
	            network.addGate(from, to, gate_1);
	            this.gater.push(gate_1);
	            // use the unit's state to store the chances to drop
	            network.engine.state[gate_1] = this.chances;
	            // self-connect the unit so it keeps its state
	            network.addConnection(gate_1, gate_1);
	        }
	        // this layer doesn't change the boundary's dimensions
	        return {
	            width: boundary.width,
	            height: boundary.height,
	            depth: boundary.depth,
	            layer: this.layer
	        };
	    };
	    return Dropout;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Dropout;


/***/ },
/* 16 */
/***/ function(module, exports) {

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
	        // set the boundary for next layer
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


/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";
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
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Input2D;


/***/ },
/* 18 */
/***/ function(module, exports) {

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
	        // set the boundary for next layer
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


/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";
	// this is a direct all-to-all connection from input to output
	var Direct = (function () {
	    function Direct() {
	    }
	    Direct.prototype.reverseInit = function (network, boundary) {
	        if (boundary != null) {
	            throw new Error('\'InputToOutput\' must be the last layer of the network!');
	        }
	        var layers = network.getLayers();
	        var inputLayer = layers[0];
	        var outputLayer = layers[layers.length - 1];
	        inputLayer.forEach(function (from) {
	            outputLayer.forEach(function (to) {
	                network.addConnection(from, to);
	            });
	        });
	    };
	    return Direct;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Direct;


/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";
	// this is a basic LSTM block, consisting of a memory cell, with input, forget and output gates
	var defaults = {
	    peepholes: true
	};
	var LSTM = (function () {
	    function LSTM(memoryBlocks, _a) {
	        var peepholes = (_a === void 0 ? defaults : _a).peepholes;
	        this.memoryBlocks = memoryBlocks;
	        this.prevLayer = null;
	        this.nextLayer = null;
	        this.inputGate = null;
	        this.forgetGate = null;
	        this.memoryCell = null;
	        this.outputGate = null;
	        this.peepholes = peepholes;
	    }
	    LSTM.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'LSTM\' can\'t be the first layer of the network!');
	        }
	        this.prevLayer = boundary.layer;
	        this.inputGate = network.addLayer(this.memoryBlocks);
	        this.forgetGate = network.addLayer(this.memoryBlocks);
	        this.memoryCell = network.addLayer(this.memoryBlocks);
	        this.outputGate = network.addLayer(this.memoryBlocks);
	        // connection from previous layer to memory cell
	        connectLayers(network, this.prevLayer, this.memoryCell);
	        // self-connection from memory cell
	        connectLayers(network, this.memoryCell, this.memoryCell);
	        // connections from previous layer to gates
	        connectLayers(network, this.prevLayer, this.inputGate);
	        connectLayers(network, this.prevLayer, this.forgetGate);
	        connectLayers(network, this.prevLayer, this.outputGate);
	        // input and forget gates
	        gateLayer(network, this.inputGate, this.memoryCell, 'INBOUND');
	        gateLayer(network, this.forgetGate, this.memoryCell, 'SELF');
	        // set the boundary for next layer
	        return {
	            width: this.memoryCell.length,
	            height: 1,
	            depth: 1,
	            layer: this.memoryCell
	        };
	    };
	    LSTM.prototype.reverseInit = function (network, boundary) {
	        this.nextLayer = boundary.layer;
	        // direct connection from prevLayer to nextLayer
	        connectLayers(network, this.prevLayer, this.nextLayer);
	        // output gate
	        gateLayer(network, this.outputGate, this.memoryCell, 'OUTBOUND');
	        // recurrent connections from each memory cell to each gates (aka peepholes) - Fig. 4 (b)
	        if (this.peepholes) {
	            connectLayers(network, this.memoryCell, this.inputGate);
	            connectLayers(network, this.memoryCell, this.forgetGate);
	            connectLayers(network, this.memoryCell, this.outputGate);
	        }
	    };
	    return LSTM;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = LSTM;
	// ---
	// helper to connect layers
	function connectLayers(network, from, to, connectionType) {
	    from.forEach(function (neuronA, indexA) {
	        to.forEach(function (neuronB, indexB) {
	            if (from !== to || indexA === indexB) {
	                network.addConnection(neuronA, neuronB);
	            }
	        });
	    });
	}
	// helper to gate layers
	function gateLayer(network, gaterLayer, gatedLayer, gateType) {
	    var from, to, gater;
	    var _loop_1 = function(index) {
	        switch (gateType) {
	            // the gater layer will gate all the self connections of the gated layer
	            case 'SELF':
	                from = gatedLayer[index];
	                to = gatedLayer[index];
	                gater = gaterLayer[index];
	                network.addGate(from, to, gater);
	                break;
	            // the gater layer will gate all the inbound connections into the gated layer
	            case 'INBOUND':
	                to = gatedLayer[index];
	                gater = gaterLayer[index];
	                network.engine.connections
	                    .filter(function (connection) { return connection.to === to; }) // get all the connections projected into this unit
	                    .filter(function (connection) { return connection.from !== to; }) // filter out self-connections
	                    .map(function (connection) { return connection.from; }) // grab the unit projecting the connection
	                    .forEach(function (from) { return network.addGate(from, to, gater); }); // add a gate for each such unit
	                break;
	            // the gater layer will gate all the outbound connections from the gated layer
	            case 'OUTBOUND':
	                gatedLayer.forEach(function (neuron) {
	                    from = gatedLayer[index];
	                    gater = gaterLayer[index];
	                    network.engine.connections
	                        .filter(function (connection) { return connection.from === from; }) // get all the connections projected from this unit
	                        .filter(function (connection) { return connection.to !== from; }) // filter out self-connections
	                        .map(function (connection) { return connection.to; }) // grab the unit receiving the connection
	                        .forEach(function (to) { return network.addGate(from, to, gater); }); // add a gate for each such unit
	                });
	                break;
	        }
	    };
	    for (var index = 0; index < gaterLayer.length; index++) {
	        _loop_1(index);
	    }
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var MaxPool = (function () {
	    function MaxPool(downsampling) {
	        if (downsampling === void 0) { downsampling = 2; }
	        this.downsampling = downsampling;
	        this.gater = null;
	        this.layer = null;
	    }
	    MaxPool.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'MaxPool\' can\'t be the first layer of the network!');
	        }
	        this.gater = network.addLayer();
	        this.layer = network.addLayer();
	        var x, y, z, fromX, fromY, fromZ;
	        for (var z_1 = 0; y < boundary.depth; z_1++) {
	            for (var y_1 = 0; y_1 < boundary.height; y_1++) {
	                for (var x_1 = 0; x_1 < boundary.width; x_1 += this.downsampling) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {
	                        fromX = x_1 + offsetX;
	                        fromY = y_1;
	                        fromZ = z_1;
	                        if (this.isValid(boundary, fromX, fromY, fromZ)) {
	                            var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                            var to = unit;
	                            network.addConnection(from, to, 1);
	                            // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                            var gate = network.addUnit(Engine_1.ActivationTypes.MAX_POOLING);
	                            network.addGate(from, to, gate);
	                            this.gater.push(gate);
	                            // connect the unit from the previous layer as an input of the gate so each gate knows which input they are gating
	                            network.addConnection(from, gate);
	                        }
	                    }
	                }
	            }
	        }
	        // set the boundary for next layer
	        return {
	            width: boundary.width / this.downsampling | 0,
	            height: boundary.height,
	            depth: boundary.depth,
	            layer: this.layer
	        };
	    };
	    // returns true if the coords fall within the layer area
	    MaxPool.prototype.isValid = function (boundary, x, y, z) {
	        return x > 0 &&
	            x < boundary.width &&
	            y > 0 &&
	            y < boundary.height &&
	            z > 0 &&
	            z < boundary.depth;
	    };
	    return MaxPool;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = MaxPool;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var MaxPool2D = (function () {
	    function MaxPool2D(downsampling) {
	        if (downsampling === void 0) { downsampling = 2; }
	        this.downsampling = downsampling;
	        this.gater = null;
	        this.layer = null;
	    }
	    MaxPool2D.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'MaxPool2D\' can\'t be the first layer of the network!');
	        }
	        this.gater = network.addLayer();
	        this.layer = network.addLayer();
	        var x, y, z, fromX, fromY, fromZ;
	        for (var z_1 = 0; y < boundary.depth; z_1++) {
	            for (var y_1 = 0; y_1 < boundary.height; y_1 += this.downsampling) {
	                for (var x_1 = 0; x_1 < boundary.width; x_1 += this.downsampling) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    for (var offsetY = 0; offsetY < this.downsampling; offsetY++) {
	                        for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {
	                            fromX = x_1 + offsetX;
	                            fromY = y_1 + offsetY;
	                            fromZ = z_1;
	                            if (this.isValid(boundary, fromX, fromY, fromZ)) {
	                                var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                                var to = unit;
	                                network.addConnection(from, to, 1);
	                                // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                                var gate = network.addUnit(Engine_1.ActivationTypes.MAX_POOLING);
	                                network.addGate(from, to, gate);
	                                this.gater.push(gate);
	                                // connect the unit from the previous layer as an input of the gate so each gate knows which input they are gating
	                                network.addConnection(from, gate);
	                            }
	                        }
	                    }
	                }
	            }
	        }
	        // set the boundary for next layer
	        return {
	            width: boundary.width / this.downsampling | 0,
	            height: boundary.height / this.downsampling | 0,
	            depth: boundary.depth,
	            layer: this.layer
	        };
	    };
	    // returns true if the coords fall within the layer area
	    MaxPool2D.prototype.isValid = function (boundary, x, y, z) {
	        return x > 0 &&
	            x < boundary.width &&
	            y > 0 &&
	            y < boundary.height &&
	            z > 0 &&
	            z < boundary.depth;
	    };
	    return MaxPool2D;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = MaxPool2D;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var MaxPool3D = (function () {
	    function MaxPool3D(downsampling) {
	        if (downsampling === void 0) { downsampling = 2; }
	        this.downsampling = downsampling;
	        this.downsampling = downsampling;
	        this.gater = null;
	        this.layer = null;
	    }
	    MaxPool3D.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'MaxPool3D\' can\'t be the first layer of the network!');
	        }
	        this.gater = network.addLayer();
	        this.layer = network.addLayer();
	        var x, y, z, fromX, fromY, fromZ;
	        for (var z_1 = 0; y < boundary.depth; z_1 += this.downsampling) {
	            for (var y_1 = 0; y_1 < boundary.height; y_1 += this.downsampling) {
	                for (var x_1 = 0; x_1 < boundary.width; x_1 += this.downsampling) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    for (var offsetZ = 0; offsetZ < this.downsampling; offsetZ++) {
	                        for (var offsetY = 0; offsetY < this.downsampling; offsetY++) {
	                            for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {
	                                fromX = x_1 + offsetX;
	                                fromY = y_1 + offsetY;
	                                fromZ = z_1 + offsetZ;
	                                if (this.isValid(boundary, fromX, fromY, fromZ)) {
	                                    var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                                    var to = unit;
	                                    network.addConnection(from, to, 1);
	                                    // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                                    var gate = network.addUnit(Engine_1.ActivationTypes.MAX_POOLING);
	                                    network.addGate(from, to, gate);
	                                    this.gater.push(gate);
	                                    // connect the unit from the previous layer as an input of the gate so each gate knows which input they are gating
	                                    network.addConnection(from, gate);
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        }
	        // set the boundary for next layer
	        return {
	            width: boundary.width / this.downsampling | 0,
	            height: boundary.height / this.downsampling | 0,
	            depth: boundary.depth / this.downsampling | 0,
	            layer: this.layer
	        };
	    };
	    // returns true if the coords fall within the layer area
	    MaxPool3D.prototype.isValid = function (boundary, x, y, z) {
	        return x > 0 &&
	            x < boundary.width &&
	            y > 0 &&
	            y < boundary.height &&
	            z > 0 &&
	            z < boundary.depth;
	    };
	    return MaxPool3D;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = MaxPool3D;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var ZeroPadding = (function () {
	    function ZeroPadding(padding) {
	        this.padding = padding;
	        this.layer = null;
	    }
	    ZeroPadding.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'ZeroPadding\' can\'t be the first layer of the network!');
	        }
	        this.layer = network.addLayer();
	        var x, y, z, from, to;
	        for (z = 0; z < boundary.depth; z++) {
	            for (y = 0; y < boundary.height; y++) {
	                for (x = -this.padding; x < boundary.width + this.padding; x++) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    // only connect the non-padding units
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
	    // returns true if the coords fall within the zero-padding area
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


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var ZeroPadding2D = (function () {
	    function ZeroPadding2D(padding) {
	        this.padding = padding;
	        this.layer = null;
	    }
	    ZeroPadding2D.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'ZeroPadding2D\' can\'t be the first layer of the network!');
	        }
	        this.layer = network.addLayer();
	        var x, y, z, from, to;
	        for (z = 0; z < boundary.depth; z++) {
	            for (y = -this.padding; y < boundary.height + this.padding; y++) {
	                for (x = -this.padding; x < boundary.width + this.padding; x++) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    // only connect the non-padding units
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
	            height: boundary.height + this.padding * 2,
	            depth: boundary.height,
	            layer: this.layer
	        };
	    };
	    // returns true if the coords fall within the zero-padding area
	    ZeroPadding2D.prototype.isPadding = function (boundary, x, y, z) {
	        return x < 0 ||
	            x > boundary.width ||
	            y < 0 ||
	            y > boundary.height ||
	            z < 0 ||
	            z > boundary.depth;
	    };
	    return ZeroPadding2D;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ZeroPadding2D;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Engine_1 = __webpack_require__(1);
	var ZeroPadding3D = (function () {
	    function ZeroPadding3D(padding) {
	        this.padding = padding;
	        this.layer = null;
	    }
	    ZeroPadding3D.prototype.init = function (network, boundary) {
	        if (boundary == null) {
	            throw new Error('\'ZeroPadding3D\' can\'t be the first layer of the network!');
	        }
	        this.layer = network.addLayer();
	        var x, y, z, from, to;
	        for (z = -this.padding; z < boundary.depth + this.padding; z++) {
	            for (y = -this.padding; y < boundary.height + this.padding; y++) {
	                for (x = -this.padding; x < boundary.width + this.padding; x++) {
	                    var unit = network.addUnit(Engine_1.ActivationTypes.IDENTITY);
	                    this.layer.push(unit);
	                    // only connect the non-padding units
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
	            height: boundary.height + this.padding * 2,
	            depth: boundary.height + this.padding * 2,
	            layer: this.layer
	        };
	    };
	    // returns true if the coords fall within the zero-padding area
	    ZeroPadding3D.prototype.isPadding = function (boundary, x, y, z) {
	        return x < 0 ||
	            x > boundary.width ||
	            y < 0 ||
	            y > boundary.height ||
	            z < 0 ||
	            z > boundary.depth;
	    };
	    return ZeroPadding3D;
	}());
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ZeroPadding3D;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=synaptic.js.map