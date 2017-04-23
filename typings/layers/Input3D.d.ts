import Network, { Boundary, Layer } from '../Network';
export default class Input3D implements Layer {
    width: number;
    height: number;
    depth: number;
    layer: number[];
    constructor(width: number, height: number, depth: number);
    init(network: Network, boundary: Boundary): Boundary;
}
