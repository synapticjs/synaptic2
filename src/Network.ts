import { Lysergic, Activations, ILysergicOptions, StatusTypes, Topology } from 'lysergic';
import backends, { Backend } from './backends';

export interface Boundary {
  width: number;
  height: number;
  depth: number;
  layer: number[];
  layerIndex?: number;
  totalLayers?: number;
}

export interface Layer {
  layer?: number[];
  init?(network: Network, boundary: Boundary): Boundary;
  reverseInit?(network: Network, boundary: Boundary);
}

export default class Network {
  compiler: Lysergic;
  backend: Backend;

  generator: () => number = Math.random.bind(this);

  boundaries: Boundary[] = [];

  constructor(options: { backend?: typeof Backend; engine?: Lysergic; layers?: Layer[], engineOptions?: ILysergicOptions, generator?: () => number });
  constructor(...layers: Layer[]);
  constructor(...args) {
    let layers: Layer[];

    let options = args[0];

    let engine: Lysergic = null;
    let backendCtor = null;

    let engineOptions: ILysergicOptions = {};

    if (hasOptions(options)) {
      if ('backend' in options) {
        backendCtor = options.backend;
      }

      if ('engine' in options) {
        engine = options.engine;
      }

      if ('engineOptions' in options) {
        engineOptions = options.engineOptions;
      }

      layers = options.layers || [];
    } else {
      layers = [...args];
    }

    if (options.generator) {
      this.generator = options.generator;
    }

    engine = engine || new Lysergic(engineOptions);
    backendCtor = backendCtor || backends.ASM;


    this.backend = new backendCtor(engine);
    this.compiler = this.backend.compiler;

    let prevBoundary: Boundary = null;
    let nextBoundary: Boundary = null;

    // init layers
    this.compiler.engineStatus = StatusTypes.INIT;
    const boundaries: Boundary[] = this.boundaries = [];
    layers.forEach((layer, i) => {
      prevBoundary = layer.init && layer.init(this, prevBoundary) || prevBoundary;
      prevBoundary = { ...prevBoundary, layerIndex: i, totalLayers: layers.length };

      if (!prevBoundary.layer) {
        throw new Error(`Your layer index ${i} doesn't expose any layer`);
      }

      let expectedNeurons = prevBoundary.width * prevBoundary.height * prevBoundary.depth;

      if (expectedNeurons == 0) {
        throw new Error(`Invalid boundary dimentions, expecting unit count to be > 0. Got 0`);
      }

      if (expectedNeurons != prevBoundary.layer.length) {
        throw new Error(`Your layer index ${i} doesn't contain the right ammount of units. Got ${prevBoundary.layer.length} Expecting ${expectedNeurons}`);
      }

      boundaries.push(prevBoundary);
    });

    // reverse init layers
    this.compiler.engineStatus = StatusTypes.REVERSE_INIT;
    boundaries.reverse();
    layers.concat().reverse()
      .forEach((layer, index) => {
        nextBoundary = boundaries[index - 1] || nextBoundary;
        layer.reverseInit && layer.reverseInit(this, nextBoundary);
      });

    // done
    this.compiler.engineStatus = StatusTypes.IDLE;
  }

  randomNorm(mean = 0, stdDev = 1) {
    let V1, V2, S, X;

    do {
      let U1 = this.generator();
      let U2 = this.generator();
      V1 = (2 * U1) - 1;
      V2 = (2 * U2) - 1;
      S = (V1 * V1) + (V2 * V2);
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + stdDev * X;
    return X;
  }

  addUnit(options: Topology.ITopologyUnitOptions): number;
  addUnit(activationFunction?: Activations.ActivationTypes, bias?: boolean): number;
  addUnit() {
    if (typeof arguments[0] == 'object')
      return this.compiler.addUnit(arguments[0]);
    return this.compiler.addUnit({ activationFunction: arguments[0], bias: arguments[1] });
  }

  addConnection(from: number, to: number, weight: number = this.randomNorm()) {
    return this.compiler.addConnection(from, to, weight);
  }

  addGate(from: number, to: number, gater: number) {
    return this.compiler.addGate(from, to, gater);
  }

  addLayer(): number[];
  addLayer(size: number, options?: Topology.ITopologyUnitOptions): number[];
  addLayer(width: number, height: number, options?: Topology.ITopologyUnitOptions): number[];
  addLayer(width: number, height: number, depth: number, options?: Topology.ITopologyUnitOptions): number[];
  addLayer() {
    let args: any[] = Array.prototype.slice.apply(arguments);
    let options: Topology.ITopologyUnitOptions = {};

    if (args.length > 0) {
      if (typeof args[args.length - 1] == 'object') {
        options = args.pop();
      }

      let unitCount = args.reduce(($, $$) => (+$) * (+$$), 1);

      if (isNaN(unitCount) || unitCount <= 0) {
        throw new Error('Network.addLayer: unit number must be > 0. Got: ' + unitCount);
      }

      return this.compiler.topology.addLayer(unitCount, options);
    } else {
      return this.compiler.topology.addLayer(0, options);
    }
  }

  getLayers() {
    return this.compiler.topology.layers.slice(); // return a clone of the layers array
  }

  toJSON() {
    return this.compiler.toJSON();
  }

  clone() {
    return Network.fromJSON(this.toJSON());
  }

  activate(input: number[]) {
    return this.backend.activate(input);
  }

  propagate(target: number[]) {
    return this.backend.propagate(target);
  }

  static fromJSON(json) {
    const engine = Lysergic.fromJSON(json);
    return new Network({ engine });
  }

  async build() {
    if (this.compiler.engineStatus != StatusTypes.IDLE) {
      throw new Error('You cannot build the network on state ' + StatusTypes[this.compiler.engineStatus]);
    }
    this.compiler.engineStatus = StatusTypes.BUILDING;

    await this.compiler.build();
    await this.backend.build();
    this.compiler.engineStatus = StatusTypes.IDLE;
  }
}


// -- helper to figure out if the user passed options or just layers

function hasOptions(args) {
  return args && (args.layers || args.engine || args.backend || args.bias || args.generator) && !args[0];
}
