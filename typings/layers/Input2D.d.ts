import Network, { Boundary, Layer } from '../Network';
export default class Input2D implements Layer {
    width: number;
    height: number;
    layer: number[];
    constructor(width: number, height: number);
    init(network: Network, boundary: Boundary): Boundary;
}
