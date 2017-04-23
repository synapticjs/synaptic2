import Network, { Boundary, Layer } from '../Network';
export default class Input implements Layer {
    size: number;
    layer: number[];
    constructor(size: number);
    init(network: Network, boundary: Boundary): Boundary;
}
