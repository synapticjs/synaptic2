type Vartype = | 'Int8'
    | 'Uint8'
    | 'Uint8Clamped'
    | 'Int16'
    | 'Uint16'
    | 'Int32'
    | 'Uint32'
    | 'Float32'
    | 'Float64';

export class Pointer {
    type: Vartype;
    size: number;
    predefinedValue: any;

    allocate() {
        return [this.type, this.size]
    }

    constructor(type, size) {
        this.type = type;
        this.size = size;
    }

    predefine(value) {
        this.predefinedValue = value;
        return this;
    }
}

export class Num extends Pointer {
    constructor(type) {
        super(type, 1);
    }
}

export class Tensor extends Pointer {
    shape: number[];

    allocate() {
        return [this.type + 'Tensor', this.size, this.shape]
    }

    constructor(type, shape) {
        if (shape.length < 1)
            throw new TypeError('at least one shape should be presented for Tensor');

        super(type, shape.reduce((a, b) => a * b));
        this.shape = shape;
    }
}