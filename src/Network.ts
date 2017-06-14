import Lysergic, { StatusTypes, ActivationTypes, ILysergicOptions } from 'lysergic';
import backends, { Backend } from './backends';



export interface Boundary {
  width: number;
  height: number;
  depth: number;
  layer: number[];
}

export interface Layer {
  layer?: number[];
  init?(network: Network, boundary: Boundary): Boundary;
  reverseInit?(network: Network, boundary: Boundary);
}

export default class Network {
  engine: Lysergic;
  backend: Backend;

  constructor(options: { backend?: typeof Backend; engine?: Lysergic; layers?: Layer[], engineOptions?: ILysergicOptions });
  constructor(...layers: Layer[]);
  constructor(...args) {
    let layers;

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

    engine = engine || new Lysergic(engineOptions);
    backendCtor = backendCtor || backends.ASM;

    this.backend = new backendCtor(engine);
    this.engine = this.backend.engine;

    let prevBoundary: Boundary = null;
    let nextBoundary: Boundary = null;

    // init layers
    this.engine.status = StatusTypes.INIT;
    const boundaries: Boundary[] = [];
    layers.forEach(layer => {
      prevBoundary = layer.init && layer.init(this, prevBoundary) || prevBoundary;
      boundaries.push(prevBoundary);
    });

    // reverse init layers
    this.engine.status = StatusTypes.REVERSE_INIT;
    boundaries.reverse();
    layers.concat().reverse()
      .forEach((layer, index) => {
        nextBoundary = boundaries[index - 1] || nextBoundary;
        layer.reverseInit && layer.reverseInit(this, nextBoundary);
      });

    // done
    this.engine.status = StatusTypes.IDLE;
  }

  addUnit(activationFunction?: ActivationTypes, biased = true) {
    return this.engine.addUnit(activationFunction, biased);
  }

  addConnection(from: number, to: number, weight: number = null) {
    return this.engine.addConnection(from, to, weight);
  }

  addGate(from: number, to: number, gater: number) {
    return this.engine.addGate(from, to, gater);
  }

  addLayer(width = 0, height = 1, depth = 1) {
    return this.engine.addLayer(width * height * depth);
  }

  getLayers() {
    return this.engine.layers.slice(); // return a clone of the layers array
  }

  toJSON() {
    return this.engine.toJSON();
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
    await this.backend.build();
  }
}

// -- helper to figure out if the user passed options or just layers

function hasOptions(args) {
  return args && (args.layers || args.engine || args.backend || args.bias || args.generator) && !args[0];
}
