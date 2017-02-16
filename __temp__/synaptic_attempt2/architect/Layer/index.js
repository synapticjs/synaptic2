// @flow
import R from 'ramda';
import type {Pointer} from '../../pointers/';
type LayerInit = {
	inputShapes: Shape[],
	outputShape: Shape | null;
};

const nameMap: WeakMap<Object, string> = new WeakMap();

const stringifyShape = shape => Array.isArray(shape) ? shape.join(',') : String(shape);

export class Layer {
	pointers: ?Pointer[] = [];
	inputShapes: Shape[];
	static name: string; //constructor function name. just annotation

	static get type(): string {
		if (!nameMap.has(this))
			this.type = this.name;

		return nameMap.get(this);
	}

	static set type(val: string) {
		if (!nameMap.has(this))
			nameMap.set(this, val);
		else
			throw new Error('this type is already defined')
	}

	get type(): string {
		return this.constructor.type
	}

	constructor({inputShapes, outputShape}: LayerInit) {
		this.inputShapes = inputShapes;
		this.outputShape = outputShape;
	}

	_output_shape: Shape | null;

	set outputShape(val: Shape | null) {
		if (!R.equals(this.pipe_shape(...this.inputShapes), val))
			throw new TypeError(`output shape is improper, expected to see ${stringifyShape(this.pipe_shape(...this.inputShapes))}, got ${stringifyShape(val)}`);

		this._output_shape = val;
	}

	get outputShape(): Shape | null {
		return this._output_shape;
	}

	pipe_shape(...inputShapes: Shape[]): Shape | null {
		return inputShapes[0] || null;
	}

	dump(): Object {
		return {type: this.type};
	}
}

export class SingleInputLayer extends Layer {
	constructor({inputShape, ...rest}: Object) {
		super({inputShapes: [inputShape], ...rest});
	}
}