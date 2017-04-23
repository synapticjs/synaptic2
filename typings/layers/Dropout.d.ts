import Network, { Boundary, Layer } from '../Network';
export default class Dropout implements Layer {
    chances: number;
    gater: number[];
    layer: number[];
    constructor(chances: number);
    init(network: Network, boundary: Boundary): Boundary;
}
