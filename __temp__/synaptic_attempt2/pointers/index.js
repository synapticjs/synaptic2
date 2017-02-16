type Allocation = ?Float32Array;

export class Pointer {
	shape: Shape;

	get size() { return this.shape.reduce((a, b) => a * b, 1) }

	constructor(shape: Shape) {
		this.shape = shape;
	}

	async read(): Promise<Allocation> { throw new Error('method not registered') }

	async write(data: Allocation): Promise<void> { throw new Error('method not registered') }

	/*do nothing by default*/
	async init(): Promise<void> {}

	/*do nothing by default*/
	async destroy(): Promise<void> {}
}

class UnboundPointer extends Pointer {
	data: Allocation;

	constructor(shape: Shape) {
		super(shape);
	}

	async read(): Promise<Allocation> { return this.data }

	async write(data: Allocation): Promise<void> { this.data = data }
}

type PointerClass = Class<Pointer>;

export class PointerPointer extends Pointer {
	constructor(shape) {
		super(shape);
		this.pointer = new UnboundPointer(shape);
	}

	write(data) { return this.pointer.write(data) }

	read() { return this.pointer.read() }

	async switchToPointer(Constructor: PointerClass) {
		const currentPointer = this.pointer;
		const newPointer = new Constructor(this.shape);
		await newPointer.init()
		this.pointer = newPointer;
		const data = await currentPointer.read();
		await newPointer.write(data);
		await currentPointer.destroy();
	}
}