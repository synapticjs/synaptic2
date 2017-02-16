import ndarray from 'ndarray';
import {Pointer} from '../../pointers';

export class ScijsPointer extends Pointer {
	data: NDArray;
	async write(data: Float32Array) {
		this.data = ndarray(data, this.shape)
	}

	async read() {
		return this.data.data;
	}
}