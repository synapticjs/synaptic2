import {Layer} from '../internal/layer';
export class ProgrammaticInput extends Layer {
    constructor(shape, value) {
        super(null, shape);
        this.properties.value = value;
    }
}

export class ProgrammaticRandomInput extends Layer {
    constructor(shape, mean, deviation) {
        super(null, shape);
        this.properties.mean = mean;
        this.properties.deviation = deviation;
    }
}