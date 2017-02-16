import {Layer} from '../Layer';
import {input} from '../../constants/layerNames';
import {PointerPointer} from '../../pointers/';

export class InputLayer extends Layer {
	static type = input;

	constructor(shape: Shape) {
		super({inputShapes: [], outputShape: shape})
		this.pointers = [new PointerPointer(shape)];
	}

	get value() {
		return this.pointers[0];
	}

	_output_shape: Shape;

	set outputShape(val: Shape) { this._output_shape = val; }

	get outputShape(): Shape { return this._output_shape; }
}