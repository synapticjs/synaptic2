import {Layer} from '../Layer';
import {output} from '../../constants/layerNames';
import {PointerPointer} from '../../pointers/';

export class OutputLayer extends Layer {
	static type = output;

	constructor(shape: Shape) {
		super({inputShapes: [shape], outputShape: null})
		this.pointers = [new PointerPointer(shape)];
	}

	get value() {
		return this.pointers[0];
	}

	pipe_shape() { return null; }
}