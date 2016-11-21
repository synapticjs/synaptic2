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

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.layers = exports.backends = exports.Trainer = exports.Network = exports.Engine = undefined;

	var _Engine = __webpack_require__(1);

	var _Engine2 = _interopRequireDefault(_Engine);

	var _Network = __webpack_require__(2);

	var _Network2 = _interopRequireDefault(_Network);

	var _Trainer = __webpack_require__(4);

	var _Trainer2 = _interopRequireDefault(_Trainer);

	var _ASM = __webpack_require__(5);

	var _ASM2 = _interopRequireDefault(_ASM);

	var _BLAS = __webpack_require__(6);

	var _BLAS2 = _interopRequireDefault(_BLAS);

	var _CPU = __webpack_require__(7);

	var _CPU2 = _interopRequireDefault(_CPU);

	var _GPU = __webpack_require__(8);

	var _GPU2 = _interopRequireDefault(_GPU);

	var _Paper = __webpack_require__(3);

	var _Paper2 = _interopRequireDefault(_Paper);

	var _WebWorker = __webpack_require__(9);

	var _WebWorker2 = _interopRequireDefault(_WebWorker);

	var _Activation = __webpack_require__(10);

	var _Activation2 = _interopRequireDefault(_Activation);

	var _Convolution = __webpack_require__(11);

	var _Convolution2 = _interopRequireDefault(_Convolution);

	var _Convolution2D = __webpack_require__(12);

	var _Convolution2D2 = _interopRequireDefault(_Convolution2D);

	var _Convolution3D = __webpack_require__(13);

	var _Convolution3D2 = _interopRequireDefault(_Convolution3D);

	var _Dense = __webpack_require__(14);

	var _Dense2 = _interopRequireDefault(_Dense);

	var _Dropout = __webpack_require__(15);

	var _Dropout2 = _interopRequireDefault(_Dropout);

	var _Input = __webpack_require__(16);

	var _Input2 = _interopRequireDefault(_Input);

	var _Input2D = __webpack_require__(17);

	var _Input2D2 = _interopRequireDefault(_Input2D);

	var _Input3D = __webpack_require__(18);

	var _Input3D2 = _interopRequireDefault(_Input3D);

	var _InputToOutput = __webpack_require__(19);

	var _InputToOutput2 = _interopRequireDefault(_InputToOutput);

	var _LSTM = __webpack_require__(20);

	var _LSTM2 = _interopRequireDefault(_LSTM);

	var _MaxPool = __webpack_require__(21);

	var _MaxPool2 = _interopRequireDefault(_MaxPool);

	var _MaxPool2D = __webpack_require__(22);

	var _MaxPool2D2 = _interopRequireDefault(_MaxPool2D);

	var _MaxPool3D = __webpack_require__(23);

	var _MaxPool3D2 = _interopRequireDefault(_MaxPool3D);

	var _ZeroPadding = __webpack_require__(24);

	var _ZeroPadding2 = _interopRequireDefault(_ZeroPadding);

	var _ZeroPadding2D = __webpack_require__(25);

	var _ZeroPadding2D2 = _interopRequireDefault(_ZeroPadding2D);

	var _ZeroPadding3D = __webpack_require__(26);

	var _ZeroPadding3D2 = _interopRequireDefault(_ZeroPadding3D);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// backends
	var backends = {
	  ASM: _ASM2.default,
	  BLAS: _BLAS2.default,
	  CPU: _CPU2.default,
	  GPU: _GPU2.default,
	  Paper: _Paper2.default,
	  WebWorker: _WebWorker2.default
	};

	// layers
	// core


	var layers = {
	  Activation: _Activation2.default,
	  Convolution: _Convolution2.default,
	  Convolution2D: _Convolution2D2.default,
	  Convolution3D: _Convolution3D2.default,
	  Dense: _Dense2.default,
	  Dropout: _Dropout2.default,
	  Input: _Input2.default,
	  Input2D: _Input2D2.default,
	  Input3D: _Input3D2.default,
	  InputToOutput: _InputToOutput2.default,
	  LSTM: _LSTM2.default,
	  MaxPool: _MaxPool2.default,
	  MaxPool2D: _MaxPool2D2.default,
	  MaxPool3D: _MaxPool3D2.default,
	  ZeroPadding: _ZeroPadding2.default,
	  ZeroPadding2D: _ZeroPadding2D2.default,
	  ZeroPadding3D: _ZeroPadding3D2.default
	};

	exports.Engine = _Engine2.default;
	exports.Network = _Network2.default;
	exports.Trainer = _Trainer2.default;
	exports.backends = backends;
	exports.layers = layers;

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
	// trying to keep the code as close as posible to the equations and as verbose as possible.

	// -- Activation Types

	var ActivationTypes = exports.ActivationTypes = {
	  LOGISTIC_SIGMOID: 0,
	  TANH: 1,
	  RELU: 2,
	  MAX_POOLING: 3,
	  DROPOUT: 4,
	  IDENTITY: 5
	};

	// -- Status Types

	var StatusTypes = exports.StatusTypes = {
	  IDLE: 0,
	  INIT: 1,
	  REVERSE_INIT: 2,
	  ACTIVATING: 3,
	  PROPAGATING: 4,
	  TRAINING: 5
	};

	// -- Engine

	var defaults = {
	  bias: true,
	  generator: function generator() {
	    return Math.random() * 2 - 1;
	  }
	};

	var Engine = function () {
	  function Engine() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaults,
	        bias = _ref.bias,
	        generator = _ref.generator;

	    _classCallCheck(this, Engine);

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
	    this.random = generator;
	    this.biasUnit = null;
	    this.status = StatusTypes.IDLE;

	    // if using bias, create a bias unit, with a fixed activation of 1
	    if (bias) {
	      this.biasUnit = this.addUnit();
	      this.activation[this.biasUnit] = 1;
	    }
	  }

	  _createClass(Engine, [{
	    key: 'addUnit',
	    value: function addUnit() {
	      var activationFunction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ActivationTypes.LOGISTIC_SIGMOID;

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
	    }
	  }, {
	    key: 'addConnection',
	    value: function addConnection(from, to) {
	      var weight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	      // if the connection already exists then return
	      if (this.connections.some(function (connection) {
	        return connection.from === from && connection.to === to;
	      })) {
	        return;
	      }
	      // add the connection to the list
	      this.connections.push({ from: from, to: to });

	      // setup connection
	      var j = to;
	      var i = from;
	      var isSelfConnection = from === to;
	      this.gain[j][i] = 1; // ungated connections have a gain of 1 (eq. 14)
	      this.weight[j][i] = isSelfConnection ? 1 : weight == null ? this.random() : weight; // self-connections have a fixed weight of 1 (this is explained in the text between eq. 14 and eq. 15)
	      this.elegibilityTrace[j][i] = 0;
	      this.extendedElegibilityTrace[j][i] = {};

	      // track units
	      this.track(to);
	      this.track(from);
	    }
	  }, {
	    key: 'addGate',
	    value: function addGate(from, to, gater) {
	      // if the connection is already gated or is a bias connection then return
	      var alreadyGated = this.gates.some(function (gate) {
	        return gate.from === from && gate.to === to;
	      });
	      var isBias = from === this.biasUnit;
	      if (alreadyGated || isBias) {
	        return;
	      }

	      this.gates.push({ from: from, to: to, gater: gater });

	      // track units
	      this.track(to);
	      this.track(from);
	      this.track(gater);
	    }
	  }, {
	    key: 'addLayer',
	    value: function addLayer() {
	      var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	      var activationFunction = arguments[1];

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
	    }
	  }, {
	    key: 'track',
	    value: function track(unit) {
	      var _this = this;

	      // each unit keeps track of all the units that project a connection into it (aka inputs)
	      this.inputsOf[unit] = uniq(this.connections.filter(function (connection) {
	        return connection.to === unit;
	      }).map(function (connection) {
	        return connection.from;
	      }));

	      // each unit keeps track of all the units that receive a connection from them (aka projections)
	      this.projectedBy[unit] = uniq(this.connections.filter(function (connection) {
	        return connection.from === unit;
	      }).map(function (connection) {
	        return connection.to;
	      }));

	      // each unit keeps track of all the other units gating connections into it
	      this.gatersOf[unit] = uniq(this.gates.filter(function (gate) {
	        return gate.to === unit;
	      }).map(function (gate) {
	        return gate.gater;
	      }));

	      // each unit keeps track of all the units that receive connections gated by them
	      this.gatedBy[unit] = uniq(this.gates.filter(function (gate) {
	        return gate.gater === unit;
	      }).map(function (gate) {
	        return gate.to;
	      }));

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
	        connections to k are gated by j (and are not a self-connection)
	      */

	      // track inputs of unit gated by j
	      this.inputsOf[unit].forEach(function (i) {
	        _this.gatersOf[unit].forEach(function (j) {
	          _this.inputsOfGatedBy[unit][j] = uniq(_this.inputsOfGatedBy[unit][j], _this.gates.filter(function (gate) {
	            return gate.gater === j && gate.to === unit && gate.from === i && gate.to !== gate.from;
	          }).map(function (gate) {
	            return gate.from;
	          }));
	        });
	      });
	      // track inputs of k gated by unit
	      this.gatedBy[unit].forEach(function (k) {
	        _this.inputsOf[k].forEach(function (i) {
	          _this.inputsOfGatedBy[k][unit] = uniq(_this.inputsOfGatedBy[k][unit], _this.gates.filter(function (gate) {
	            return gate.gater === unit && gate.to === k && gate.from === i && gate.to !== gate.from;
	          }).map(function (gate) {
	            return gate.from;
	          }));
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
	        _this.derivativeTerm[k][unit] = _this.gates.some(function (gate) {
	          return gate.to === k && gate.from === k && gate.gater === unit;
	        }) ? 1 : 0;
	      });
	      // compute derivative term for unit gated by j
	      this.gatersOf[unit].forEach(function (j) {
	        _this.derivativeTerm[unit][j] = _this.gates.some(function (gate) {
	          return gate.to === unit && gate.from === unit && gate.gater === j;
	        }) ? 1 : 0;
	      });

	      // each unit keeps track of all the other units that project a connection into them, and that are not self-connections (see eq. 4)
	      this.inputSet[unit] = this.inputsOf[unit].filter(function (input) {
	        return input !== unit;
	      });

	      // each unit keeps track of all the other units that they project connections into, and that are downstream of them (see eq. 19)
	      this.projectionSet[unit] = this.projectedBy[unit].filter(function (projected) {
	        return projected > unit;
	      });

	      // each unit keeps track of all the units that they are gating a connection into, and that are downstream of them (see eq. 20)
	      this.gateSet[unit] = this.gatedBy[unit].filter(function (gated) {
	        return gated > unit;
	      });
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
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
	    }
	  }, {
	    key: 'clone',
	    value: function clone() {
	      return Engine.fromJSON(this.toJSON());
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      // TODO: this should wipe all the elegibilityTrace's and extendedElegibilityTrace's to clear the networks context
	    }
	  }]);

	  return Engine;
	}();

	exports.default = Engine;


	Engine.fromJSON = function (json) {
	  var data = JSON.parse(json);
	  var engine = new Engine();
	  Object.keys(data).forEach(function (key) {
	    return engine[key] = data[key];
	  });
	  return engine;
	};

	// helper for removing duplicated ints from an array
	function uniq() {
	  for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
	    arrays[_key] = arguments[_key];
	  }

	  var concated = arrays.reduce(function (concated, array) {
	    return concated.concat(array || []);
	  }, []);
	  var o = {},
	      a = [],
	      i;
	  for (i = 0; i < concated.length; o[concated[i++]] = 1) {}
	  for (i in o) {
	    a.push(+i);
	  }return a;
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	var _Engine2 = _interopRequireDefault(_Engine);

	var _Paper = __webpack_require__(3);

	var _Paper2 = _interopRequireDefault(_Paper);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Network = function () {
	  function Network() {
	    var _this = this;

	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

	    _classCallCheck(this, Network);

	    var layers = void 0;

	    if (hasOptions(options)) {
	      if ('backend' in options) {
	        this.backend = options.backend;
	      } else if ('engine' in options) {
	        this.backend = new _Paper2.default(options.engine);
	      } else if ('bias' in options || 'generator' in options) {
	        var engine = new _Engine2.default(options);
	        this.backend = new _Paper2.default(engine);
	      }
	      layers = options.layers;
	    } else {
	      this.backend = new _Paper2.default();
	      layers = [].concat(_toConsumableArray(options));
	    }

	    this.engine = this.backend.engine;

	    var prevBoundary = null;
	    var nextBoundary = null;

	    // init layers
	    this.engine.status = _Engine.StatusTypes.INIT;
	    var boundaries = [];
	    layers.forEach(function (layer) {
	      prevBoundary = layer.init && layer.init(_this, prevBoundary) || prevBoundary;
	      boundaries.push(prevBoundary);
	    });

	    // reverse init layers
	    this.engine.status = _Engine.StatusTypes.REVERSE_INIT;
	    boundaries.reverse();
	    layers.reverse().forEach(function (layer, index) {
	      nextBoundary = boundaries[index - 1] || nextBoundary;
	      layer.reverseInit && layer.reverseInit(_this, nextBoundary);
	    });

	    // done
	    this.engine.status = _Engine.StatusTypes.IDLE;
	  }

	  _createClass(Network, [{
	    key: 'addUnit',
	    value: function addUnit() {
	      return this.engine.addUnit();
	    }
	  }, {
	    key: 'addConnection',
	    value: function addConnection(from, to, weight) {
	      return this.engine.addConnection(from, to, weight);
	    }
	  }, {
	    key: 'addGate',
	    value: function addGate(from, to, gater) {
	      return this.engine.addGate(from, to, gater);
	    }
	  }, {
	    key: 'addLayer',
	    value: function addLayer() {
	      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
	      var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

	      return this.engine.addLayer(width * height * depth);
	    }
	  }, {
	    key: 'getLayers',
	    value: function getLayers() {
	      return this.engine.layers.slice(); // return a clone of the layers array
	    }
	  }, {
	    key: 'toJSON',
	    value: function toJSON() {
	      return this.engine.toJSON();
	    }
	  }, {
	    key: 'clone',
	    value: function clone() {
	      return Network.fromJSON(this.toJSON());
	    }
	  }, {
	    key: 'activate',
	    value: function activate(input) {
	      return this.backend.activate(input);
	    }
	  }, {
	    key: 'propagate',
	    value: function propagate(target) {
	      this.backend.propagate(target);
	    }
	  }]);

	  return Network;
	}();

	exports.default = Network;


	Network.fromJSON = function (json) {
	  var engine = _Engine2.default.fromJSON(json);
	  return new Network({ engine: engine });
	};

	// -- helper to figure out if the user passed options or just layers

	function hasOptions(args) {
	  return args.layers && !args[0].init && !args[0].reverseInit;
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
	// trying to keep the code as close as posible to the equations and as verbose as possible.

	var _Engine = __webpack_require__(1);

	var _Engine2 = _interopRequireDefault(_Engine);

	var _Trainer = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Paper = function () {
	  function Paper(engine) {
	    _classCallCheck(this, Paper);

	    this.engine = engine || new _Engine2.default();
	  }

	  _createClass(Paper, [{
	    key: 'activateUnit',
	    value: function activateUnit(unit, input) {
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
	      } else {

	        // eq. 15
	        s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputSet[j], function (i) {
	          return g[j][i] * w[j][i] * y[i];
	        }); // compute state of j

	        // eq. 16
	        y[j] = f(j); // compute activation of j

	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = inputSet[j][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var i = _step.value;
	            // comupute elegibility traces for j's inputs

	            // eq. 17
	            ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i];

	            var _iteratorNormalCompletion3 = true;
	            var _didIteratorError3 = false;
	            var _iteratorError3 = undefined;

	            try {
	              for (var _iterator3 = gatedBy[j][Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                var k = _step3.value;
	                // compute extended elegibility traces for j's inputs

	                // eq. 18
	                xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df(j) * ε[j][i] * this.bigParenthesisTerm(k, j);
	              }
	            } catch (err) {
	              _didIteratorError3 = true;
	              _iteratorError3 = err;
	            } finally {
	              try {
	                if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                  _iterator3.return();
	                }
	              } finally {
	                if (_didIteratorError3) {
	                  throw _iteratorError3;
	                }
	              }
	            }
	          }

	          // update the gain of the connections gated by this unit with its activation value
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }

	        var _iteratorNormalCompletion2 = true;
	        var _didIteratorError2 = false;
	        var _iteratorError2 = undefined;

	        try {
	          for (var _iterator2 = gatedBy[unit][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var to = _step2.value;
	            var _iteratorNormalCompletion4 = true;
	            var _didIteratorError4 = false;
	            var _iteratorError4 = undefined;

	            try {
	              for (var _iterator4 = inputsOfGatedBy[to][unit][Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                var from = _step4.value;

	                // eq. 14
	                g[to][from] = y[unit];
	              }
	            } catch (err) {
	              _didIteratorError4 = true;
	              _iteratorError4 = err;
	            } finally {
	              try {
	                if (!_iteratorNormalCompletion4 && _iterator4.return) {
	                  _iterator4.return();
	                }
	              } finally {
	                if (_didIteratorError4) {
	                  throw _iteratorError4;
	                }
	              }
	            }
	          }
	        } catch (err) {
	          _didIteratorError2 = true;
	          _iteratorError2 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	              _iterator2.return();
	            }
	          } finally {
	            if (_didIteratorError2) {
	              throw _iteratorError2;
	            }
	          }
	        }
	      }

	      // return the activation of this unit
	      return y[j];
	    }
	  }, {
	    key: 'propagateUnit',
	    value: function propagateUnit(unit, target) {
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
	        // this is only for output neurons, the error is injected from the environment

	        // eq. 10
	        δ[j] = δP[j] = target - y[j];
	      } else {
	        // for the rest of the units the error is computed by backpropagation

	        // eq. 21
	        δP[j] = df(j) * Σ(P[j], function (k) {
	          return δ[k] * g[k][j] * w[k][j];
	        });

	        // eq. 22
	        δG[j] = df(j) * Σ(G[j], function (k) {
	          return δ[k] * _this.bigParenthesisTerm(k, j);
	        });

	        // eq. 23
	        δ[j] = δP[j] + δG[j];
	      }

	      // step 2: compute deltas (Δw) and adjust the weights for all the inputs of j

	      var _iteratorNormalCompletion5 = true;
	      var _didIteratorError5 = false;
	      var _iteratorError5 = undefined;

	      try {
	        var _loop = function _loop() {
	          var i = _step5.value;


	          // eq. 24
	          var Δw = α * δP[j] * ε[j][i] + α * Σ(G[j], function (k) {
	            return δ[k] * xε[j][i][k];
	          });

	          // apply delta
	          w[j][i] += Δw;
	        };

	        for (var _iterator5 = inputSet[j][Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	          _loop();
	        }
	      } catch (err) {
	        _didIteratorError5 = true;
	        _iteratorError5 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion5 && _iterator5.return) {
	            _iterator5.return();
	          }
	        } finally {
	          if (_didIteratorError5) {
	            throw _iteratorError5;
	          }
	        }
	      }
	    }

	    // this calculate the big parenthesis term that is present in eq. 18 and eq. 22

	  }, {
	    key: 'bigParenthesisTerm',
	    value: function bigParenthesisTerm(k, j) {
	      // glosary
	      var w = this.engine.weight;
	      var s = this.engine.state;
	      var y = this.engine.activation;
	      var dt = this.engine.derivativeTerm[k][j]; // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
	      var gatedInputs = this.engine.inputsOfGatedBy[k][j]; // this index runs over all the inputs of k, that are gated by j

	      // big parenthesis term
	      return dt * w[k][k] * s[k] + Σ(gatedInputs, function (a) {
	        return w[k][a] * y[a];
	      });
	    }
	  }, {
	    key: 'activationFunction',
	    value: function activationFunction(unit) {
	      var _this2 = this;

	      var x = void 0;
	      var type = this.engine.activationFunction[unit];

	      var _ret2 = function () {
	        switch (type) {
	          case _Engine.ActivationTypes.LOGISTIC_SIGMOID:
	            x = _this2.engine.state[unit];
	            return {
	              v: 1 / (1 + Math.exp(-x))
	            };

	          case _Engine.ActivationTypes.TANH:
	            x = _this2.engine.state[unit];
	            var eP = Math.exp(x);
	            var eN = 1 / eP;
	            return {
	              v: (eP - eN) / (eP + eN)
	            };

	          case _Engine.ActivationTypes.RELU:
	            x = _this2.engine.state[unit];
	            return {
	              v: x > 0 ? x : 0
	            };

	          case _Engine.ActivationTypes.IDENTITY:
	            x = _this2.engine.state[unit];
	            return {
	              v: x
	            };

	          case _Engine.ActivationTypes.MAX_POOLING:
	            var inputUnit = _this2.engine.inputsOf[unit][0];
	            var gatedUnit = _this2.engine.gatedBy[unit][0];
	            var inputsOfGatedUnit = _this2.engine.inputsOfGatedBy[gatedUnit][unit];
	            var maxActivation = inputsOfGatedUnit.reduce(function (max, input) {
	              return Math.max(_this2.engine.activation[input], max);
	            }, -Infinity);
	            var inputUnitWithHigherActivation = inputsOfGatedUnit.find(function (input) {
	              return _this2.engine.activation[input] === maxActivation;
	            });
	            return {
	              v: inputWithHigherActivation === inputUnit ? 1 : 0
	            };

	          case _Engine.ActivationTypes.DROPOUT:
	            var chances = _this2.engine.state[unit];
	            return {
	              v: _this2.engine.random() < chances && _this2.engine.status === _Engine.StatusTypes.TRAINING ? 0 : 1
	            };
	        }
	      }();

	      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
	    }
	  }, {
	    key: 'activationFunctionDerivative',
	    value: function activationFunctionDerivative(unit) {
	      var x = void 0;
	      var type = this.engine.activationFunction[unit];
	      switch (type) {
	        case _Engine.ActivationTypes.LOGISTIC_SIGMOID:
	          x = this.activationFunction(unit);
	          return x * (1 - x);

	        case _Engine.ActivationTypes.TANH:
	          x = this.activationFunction(unit);
	          return 1 - Math.pow(x, 2);

	        case _Engine.ActivationTypes.RELU:
	          return 0;

	        case _Engine.ActivationTypes.IDENTITY:
	          return 0;

	        case _Engine.ActivationTypes.MAX_POOLING:
	          return 0;

	        case _Engine.ActivationTypes.DROPOUT:
	          return 0;
	      }
	    }
	  }, {
	    key: 'costFunction',
	    value: function costFunction(target, predicted, costType) {
	      var i = void 0,
	          x = 0;
	      switch (costType) {
	        case _Trainer.CostTypes.MSE:
	          for (i = 0; i < target.length; i++) {
	            x += Math.pow(target[i] - predicted[i], 2);
	          }
	          return x / target.length;

	        case _Trainer.CostTypes.CROSS_ENTROPY:
	          for (i = 0; i < target.length; i++) {
	            x -= target[i] * Math.log(predicted[i] + 1e-15) + (1 - target[i]) * Math.log(1 + 1e-15 - predicted[i]); // +1e-15 is a tiny push away to avoid Math.log(0)
	          }
	          return x;

	        case _Trainer.CostTypes.BINARY:
	          for (i = 0; i < target.length; i++) {
	            x += Math.round(target[i] * 2) != Math.round(predicted[i] * 2);
	          }
	          return x;
	      }
	    }
	  }, {
	    key: 'activate',
	    value: function activate(inputs) {
	      var _this3 = this;

	      this.engine.status = _Engine.StatusTypes.ACTIVATING;
	      var activations = this.engine.layers.map(function (layer, layerIndex) {
	        return layer.map(function (unit, unitIndex) {
	          var input = layerIndex === 0 ? inputs[unitIndex] : void 0; // only units in the input layer receive an input
	          _this3.activateUnit(unit, input);
	        });
	      });
	      this.engine.status = _Engine.StatusTypes.IDLE;
	      return activations.pop(); // return activation of the last layer (aka output layer)
	    }
	  }, {
	    key: 'propagate',
	    value: function propagate(targets) {
	      var _this4 = this;

	      this.engine.status = _Engine.StatusTypes.PROPAGATING;
	      this.engine.layers.slice(1) // input layer doesn't propagate
	      .reverse() // layers propagate in reverse order
	      .forEach(function (layer, layerIndex) {
	        layer.slice().reverse() // units get propagated in reverse order
	        .forEach(function (unit, unitIndex) {
	          var target = layerIndex === 0 ? targets[unitIndex] : void 0; // only units in the output layer receive a target
	          _this4.activateUnit(unit, target);
	        });
	      });
	      this.engine.status = _Engine.StatusTypes.IDLE;
	    }
	  }, {
	    key: 'train',
	    value: function train(dataset) {
	      var _this5 = this;

	      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Trainer.defaults,
	          learningRate = _ref.learningRate,
	          minError = _ref.minError,
	          maxIterations = _ref.maxIterations,
	          costFunction = _ref.costFunction;

	      return new Promise(function (resolve) {

	        // start training
	        var startTime = new Date();
	        var error = 0;
	        var iterations = 0;

	        _this5.engine.learningRate = learningRate;
	        _this5.engine.status = _Engine.StatusTypes.TRAINING;

	        // train
	        while (error > minError && iterations < maxIterations) {
	          var _iteratorNormalCompletion6 = true;
	          var _didIteratorError6 = false;
	          var _iteratorError6 = undefined;

	          try {
	            for (var _iterator6 = dataset[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
	              var data = _step6.value;
	              var input = data.input,
	                  output = data.output;

	              var predictedOutput = _this5.activate(input);
	              _this5.propagate(output);
	              error += _this5.costFunction(output, predictedOutput, costFunction);
	            }
	          } catch (err) {
	            _didIteratorError6 = true;
	            _iteratorError6 = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion6 && _iterator6.return) {
	                _iterator6.return();
	              }
	            } finally {
	              if (_didIteratorError6) {
	                throw _iteratorError6;
	              }
	            }
	          }

	          error /= dataset.length;
	          iterations++;
	        }

	        // end training
	        _this5.engine.status = _Engine.StatusTypes.IDLE;
	        resolve({
	          error: error,
	          iterations: iterations,
	          time: new Date() - startTime
	        });
	      });
	    }
	  }]);

	  return Paper;
	}();

	// --

	// helper for doing summations


	exports.default = Paper;
	function Σ(indexes, fn) {
	  return indexes.reduce(function (sum, index) {
	    return sum + fn(index);
	  }, 0);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// -- Cost Types

	var CostTypes = exports.CostTypes = {
	  MSE: 0,
	  CROSS_ENTROPY: 1,
	  BINARY: 2
	};

	// -- defaults

	var defaults = exports.defaults = {
	  learningRate: 0.1,
	  minError: 0.05,
	  maxIterations: 2000,
	  costFunction: CostTypes.MSE
	};

	// -- Trainer

	var Trainer = function () {
	  function Trainer(network) {
	    _classCallCheck(this, Trainer);

	    this.network = network;
	  }

	  _createClass(Trainer, [{
	    key: "train",
	    value: function train(dataset, options) {
	      return network.backend.train(dataset, options);
	    }
	  }, {
	    key: "test",
	    value: function test(dataset, options) {
	      // TODO
	    }
	  }]);

	  return Trainer;
	}();

	exports.default = Trainer;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// TODO
	exports.default = {};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// TODO
	exports.default = {};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// TODO
	exports.default = {};

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// TODO
	exports.default = {};

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// TODO
	exports.default = {};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ReLU = undefined;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ReLU = exports.ReLU = function () {
	  function ReLU() {
	    _classCallCheck(this, ReLU);

	    this.layer = null;
	  }

	  _createClass(ReLU, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      var prevLayer = boundary.layer;
	      this.layer = network.addLayer(prevLayer.length, _Engine.ActivationTypes.RELU);

	      for (var i = 0; i < prevLayer.length; i++) {
	        network.addConnection(prevLayer[i], this.layer[i], 1);
	      }

	      // this layer doesn't change the boundary's dimensions
	      return _extends({}, boundary, {
	        layer: this.layer
	      });
	    }
	  }]);

	  return ReLU;
	}();

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// this is based on this article: http://cs231n.github.io/convolutional-networks/

	var Convolution = function () {
	  function Convolution(_ref) {
	    var _ref$filter = _ref.filter,
	        filter = _ref$filter === undefined ? 1 : _ref$filter,
	        _ref$height = _ref.height,
	        height = _ref$height === undefined ? 1 : _ref$height,
	        _ref$depth = _ref.depth,
	        depth = _ref$depth === undefined ? 1 : _ref$depth,
	        _ref$stride = _ref.stride,
	        stride = _ref$stride === undefined ? 1 : _ref$stride,
	        _ref$padding = _ref.padding,
	        padding = _ref$padding === undefined ? 0 : _ref$padding;

	    _classCallCheck(this, Convolution);

	    this.filter = filter;
	    this.height = height;
	    this.depth = depth;
	    this.stride = stride;
	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(Convolution, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0,
	          from = void 0,
	          to = void 0;
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
	    }

	    // returns true if the coords fall within the layer area

	  }, {
	    key: "isValid",
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return Convolution;
	}();

	exports.default = Convolution;

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// this is based on this article: http://cs231n.github.io/convolutional-networks/

	var Convolution2D = function () {
	  function Convolution2D(_ref) {
	    var _ref$filter = _ref.filter,
	        filter = _ref$filter === undefined ? 1 : _ref$filter,
	        _ref$depth = _ref.depth,
	        depth = _ref$depth === undefined ? 1 : _ref$depth,
	        _ref$stride = _ref.stride,
	        stride = _ref$stride === undefined ? 1 : _ref$stride,
	        _ref$padding = _ref.padding,
	        padding = _ref$padding === undefined ? 0 : _ref$padding;

	    _classCallCheck(this, Convolution2D);

	    this.filter = filter;
	    this.depth = depth;
	    this.stride = stride;
	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(Convolution2D, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0,
	          from = void 0,
	          to = void 0;
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
	    }

	    // returns true if the coords fall within the layer area

	  }, {
	    key: "isValid",
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return Convolution2D;
	}();

	exports.default = Convolution2D;

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// this is based on this article: http://cs231n.github.io/convolutional-networks/

	var Convolution3D = function () {
	  function Convolution3D(_ref) {
	    var _ref$filter = _ref.filter,
	        filter = _ref$filter === undefined ? 1 : _ref$filter,
	        _ref$stride = _ref.stride,
	        stride = _ref$stride === undefined ? 1 : _ref$stride,
	        _ref$padding = _ref.padding,
	        padding = _ref$padding === undefined ? 0 : _ref$padding;

	    _classCallCheck(this, Convolution3D);

	    this.filter = filter;
	    this.stride = stride;
	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(Convolution3D, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0,
	          from = void 0,
	          to = void 0;
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
	    }

	    // returns true if the coords are inside the boundara

	  }, {
	    key: "isValid",
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return Convolution3D;
	}();

	exports.default = Convolution3D;

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Dense = function () {
	  function Dense(size) {
	    _classCallCheck(this, Dense);

	    this.layer = null;
	  }

	  _createClass(Dense, [{
	    key: "init",
	    value: function init(network, boundary) {
	      var _this = this;

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
	    }
	  }]);

	  return Dense;
	}();

	exports.default = Dense;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Dropout = function () {
	  function Dropout(chances) {
	    _classCallCheck(this, Dropout);

	    this.chances = chances;
	    this.gater = null;
	    this.layer = null;
	  }

	  _createClass(Dropout, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.gater = network.addLayer();
	      this.layer = network.addLayer();

	      var unit = void 0,
	          from = void 0,
	          to = void 0,
	          gate = void 0;
	      for (var i = 0; x < boundary.layer.length; i++) {
	        unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
	        this.layer.push(unit);

	        from = boundary.layer[i];
	        to = unit;

	        // add a connection with a fixed weight of 1
	        network.addConnection(from, to, 1);

	        // this unit will act as a gate, randomly dropping inputs
	        var _gate = network.addUnit(_Engine.ActivationTypes.DROPOUT);
	        network.addGate(from, to, _gate);
	        this.gater.push(_gate);
	        // use the unit's state to store the chances to drop
	        network.engine.state[_gate] = this.chances;
	        // self-connect the unit so it keeps its state
	        network.addConnection(_gate, _gate);
	      }

	      // this layer doesn't change the boundary's dimensions
	      return _extends({}, boundary, {
	        layer: this.layer
	      });
	    }
	  }]);

	  return Dropout;
	}();

	exports.default = Dropout;

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Input = function () {
	  function Input(size) {
	    _classCallCheck(this, Input);

	    this.size = size;
	    this.layer = null;
	  }

	  _createClass(Input, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer(this.size);
	      // set the boundary for next layer
	      return {
	        width: this.size,
	        height: 1,
	        depth: 1,
	        layer: this.layer
	      };
	    }
	  }]);

	  return Input;
	}();

	exports.default = Input;

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Input2D = function () {
	  function Input2D(width, height) {
	    _classCallCheck(this, Input2D);

	    this.width = width;
	    this.height = height;
	    this.layer = null;
	  }

	  _createClass(Input2D, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer(this.width, this.height);
	      // set the boundary for next layer
	      return {
	        width: this.width,
	        height: this.height,
	        depth: 1,
	        layer: this.layer
	      };
	    }
	  }]);

	  return Input2D;
	}();

	exports.default = Input2D;

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Input3D = function () {
	  function Input3D(width, height, depth) {
	    _classCallCheck(this, Input3D);

	    this.width = width;
	    this.height = height;
	    this.depth = depth;
	    this.layer = null;
	  }

	  _createClass(Input3D, [{
	    key: "init",
	    value: function init(network, boundary) {
	      this.layer = network.addLayer(this.width, this.height, this.depth);
	      // set the boundary for next layer
	      return {
	        width: this.width,
	        height: this.height,
	        depth: this.depth,
	        layer: this.layer
	      };
	    }
	  }]);

	  return Input3D;
	}();

	exports.default = Input3D;

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// this is a direct all-to-all connection from input to output
	var Direct = exports.Direct = function () {
	  function Direct() {
	    _classCallCheck(this, Direct);
	  }

	  _createClass(Direct, [{
	    key: "reverseInit",
	    value: function reverseInit(network, boundary) {

	      var layers = network.getLayers();
	      var inputLayer = layers[0];
	      var outputLayer = layers[layers.length - 1];

	      inputLayer.forEach(function (from) {
	        outputLayer.forEach(function (to) {
	          network.addConnection(from, to);
	        });
	      });
	    }
	  }]);

	  return Direct;
	}();

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// this is a basic LSTM block, consisting of a memory cell, with input, forget and output gates

	var defaults = {
	  peepholes: true
	};

	var LSTM = function () {
	  function LSTM(memoryBlocks) {
	    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaults,
	        peepholes = _ref.peepholes;

	    _classCallCheck(this, LSTM);

	    this.memoryBlocks = memoryBlocks;
	    this.peepholes = peepholes;
	    this.prevLayer = null;
	    this.nextLayer = null;
	    this.inputGate = null;
	    this.forgetGate = null;
	    this.memoryCell = null;
	    this.outputGate = null;
	  }

	  _createClass(LSTM, [{
	    key: 'init',
	    value: function init(network, boundary) {

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
	    }
	  }, {
	    key: 'reverseInit',
	    value: function reverseInit(netowork, boundary) {

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
	    }
	  }]);

	  return LSTM;
	}();

	// ---

	// helper to connect layers


	exports.default = LSTM;
	function connectLayers(network, from, to, connectionType) {
	  from.forEach(function (neuronA, indexA) {
	    to.forEach(function (neuronB, indexB) {
	      if (from !== to || indexA === indexB) {
	        // if layers are different, connect all to all, if self-connecting layer, just connect matching indexes (elementwise)
	        network.addConnection(neuronA, neuronB);
	      }
	    });
	  });
	}

	// helper to gate layers
	function gateLayer(network, gaterLayer, gatedLayer, gateType) {
	  var from = void 0,
	      to = void 0,
	      gater = void 0;

	  var _loop = function _loop(index) {
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
	        network.engine.connections.filter(function (connection) {
	          return connection.to === to;
	        }) // get all the connections projected into this unit
	        .filter(function (connection) {
	          return connection.from !== to;
	        }) // filter out self-connections
	        .map(function (connection) {
	          return connection.from;
	        }) // grab the unit projecting the connection
	        .forEach(function (from) {
	          return network.addGate(from, to, gater);
	        }); // add a gate for each such unit
	        break;
	      // the gater layer will gate all the outbound connections from the gated layer
	      case 'OUTBOUND':
	        gatedLayer.forEach(function (neuron) {
	          from = gatedLayer[index];
	          gater = gaterLayer[index];
	          network.engine.connections.filter(function (connection) {
	            return connection.from === from;
	          }) // get all the connections projected from this unit
	          .filter(function (connection) {
	            return connection.to !== from;
	          }) // filter out self-connections
	          .map(function (connection) {
	            return connection.to;
	          }) // grab the unit receiving the connection
	          .forEach(function (to) {
	            return network.addGate(from, to, gater);
	          }); // add a gate for each such unit
	        });
	        break;
	    }
	  };

	  for (var index = 0; index < gaterLayer.length; index++) {
	    _loop(index);
	  }
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MaxPool = function () {
	  function MaxPool() {
	    var downsampling = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

	    _classCallCheck(this, MaxPool);

	    this.downsampling = downsampling;
	    this.gater = null;
	    this.layer = null;
	  }

	  _createClass(MaxPool, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.gater = network.addLayer();
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0;
	      for (var _z = 0; y < boundary.depth; _z++) {
	        for (var _y = 0; _y < boundary.height; _y++) {
	          for (var _x2 = 0; _x2 < boundary.width; _x2 += this.downsampling) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
	            this.layer.push(unit);

	            for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {

	              fromX = _x2 + offsetX;
	              fromY = _y;
	              fromZ = _z;

	              if (this.isValid(boundary, fromX, froY, fromZ)) {
	                var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                var to = unit;

	                network.addConnection(from, to, 1);

	                // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                var gate = network.addUnit(_Engine.ActivationTypes.MAX_POOLING);
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
	    }

	    // returns true if the coords fall within the layer area

	  }, {
	    key: 'isValid',
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return MaxPool;
	}();

	exports.default = MaxPool;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MaxPool2D = function () {
	  function MaxPool2D() {
	    var downsampling = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

	    _classCallCheck(this, MaxPool2D);

	    this.downsampling = downsampling;
	    this.gater = null;
	    this.layer = null;
	  }

	  _createClass(MaxPool2D, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.gater = network.addLayer();
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0;
	      for (var _z = 0; y < boundary.depth; _z++) {
	        for (var _y = 0; _y < boundary.height; _y += this.downsampling) {
	          for (var _x2 = 0; _x2 < boundary.width; _x2 += this.downsampling) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
	            this.layer.push(unit);

	            for (var offsetY = 0; offsetY < this.downsampling; offsetY++) {
	              for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {

	                fromX = _x2 + offsetX;
	                fromY = _y + offsetY;
	                fromZ = _z;

	                if (this.isValid(boundary, fromX, froY, fromZ)) {
	                  var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                  var to = unit;

	                  network.addConnection(from, to, 1);

	                  // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                  var gate = network.addUnit(_Engine.ActivationTypes.MAX_POOLING);
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
	    }

	    // returns true if the coords fall within the layer area

	  }, {
	    key: 'isValid',
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return MaxPool2D;
	}();

	exports.default = MaxPool2D;

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MaxPool3D = function () {
	  function MaxPool3D() {
	    var downsampling = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;

	    _classCallCheck(this, MaxPool3D);

	    this.downsampling = downsampling;
	    this.gater = null;
	    this.layer = null;
	  }

	  _createClass(MaxPool3D, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.gater = network.addLayer();
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          fromX = void 0,
	          fromY = void 0,
	          fromZ = void 0;
	      for (var _z = 0; y < boundary.depth; _z += this.downsampling) {
	        for (var _y = 0; _y < boundary.height; _y += this.downsampling) {
	          for (var _x2 = 0; _x2 < boundary.width; _x2 += this.downsampling) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
	            this.layer.push(unit);

	            for (var offsetZ = 0; offsetZ < this.downsampling; offsetZ++) {
	              for (var offsetY = 0; offsetY < this.downsampling; offsetY++) {
	                for (var offsetX = 0; offsetX < this.downsampling; offsetX++) {

	                  fromX = _x2 + offsetX;
	                  fromY = _y + offsetY;
	                  fromZ = _z + offsetZ;

	                  if (this.isValid(boundary, fromX, froY, fromZ)) {
	                    var from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
	                    var to = unit;

	                    network.addConnection(from, to, 1);

	                    // this unit will act as a gate, letting only the connections from the unit with the higher activation in the pool go thru
	                    var gate = network.addUnit(_Engine.ActivationTypes.MAX_POOLING);
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
	    }

	    // returns true if the coords fall within the layer area

	  }, {
	    key: 'isValid',
	    value: function isValid(boundary, x, y, z) {
	      return x > 0 && x < boundary.width && y > 0 && y < boundary.height;
	      z > 0 && z < boundary.depth;
	    }
	  }]);

	  return MaxPool3D;
	}();

	exports.default = MaxPool3D;

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ZeroPadding = function () {
	  function ZeroPadding(padding) {
	    _classCallCheck(this, ZeroPadding);

	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(ZeroPadding, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          from = void 0,
	          to = void 0;
	      for (z = 0; z < boundary.depth; z++) {
	        for (y = 0; y < boundary.height; y++) {
	          for (x = -this.padding; x < boundary.width + this.padding; x++) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
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
	    }

	    // returns true if the coords fall within the zero-padding area

	  }, {
	    key: 'isPadding',
	    value: function isPadding(boundary, x, y, z) {
	      return x < 0 || x > boundary.width || y < 0 || y > boundary.height || z < 0 || z > boundary.depth;
	    }
	  }]);

	  return ZeroPadding;
	}();

	exports.default = ZeroPadding;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ZeroPadding2D = function () {
	  function ZeroPadding2D(padding) {
	    _classCallCheck(this, ZeroPadding2D);

	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(ZeroPadding2D, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          from = void 0,
	          to = void 0;
	      for (z = 0; z < boundary.depth; z++) {
	        for (y = -this.padding; y < boundary.height + this.padding; y++) {
	          for (x = -this.padding; x < boundary.width + this.padding; x++) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
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
	    }

	    // returns true if the coords fall within the zero-padding area

	  }, {
	    key: 'isPadding',
	    value: function isPadding(boundary, x, y, z) {
	      return x < 0 || x > boundary.width || y < 0 || y > boundary.height || z < 0 || z > boundary.depth;
	    }
	  }]);

	  return ZeroPadding2D;
	}();

	exports.default = ZeroPadding2D;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _Engine = __webpack_require__(1);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var ZeroPadding2D = function () {
	  function ZeroPadding2D(padding) {
	    _classCallCheck(this, ZeroPadding2D);

	    this.padding = padding;
	    this.layer = null;
	  }

	  _createClass(ZeroPadding2D, [{
	    key: 'init',
	    value: function init(network, boundary) {
	      this.layer = network.addLayer();

	      var x = void 0,
	          y = void 0,
	          z = void 0,
	          from = void 0,
	          to = void 0;
	      for (z = -this.padding; z < boundary.depth + this.padding; z++) {
	        for (y = -this.padding; y < boundary.height + this.padding; y++) {
	          for (x = -this.padding; x < boundary.width + this.padding; x++) {

	            var unit = network.addUnit(_Engine.ActivationTypes.IDENTITY);
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
	    }

	    // returns true if the coords fall within the zero-padding area

	  }, {
	    key: 'isPadding',
	    value: function isPadding(boundary, x, y, z) {
	      return x < 0 || x > boundary.width || y < 0 || y > boundary.height || z < 0 || z > boundary.depth;
	    }
	  }]);

	  return ZeroPadding2D;
	}();

	exports.default = ZeroPadding2D;

/***/ }
/******/ ])
});
;