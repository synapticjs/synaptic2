import Network, { Boundary, Layer } from '../Network';
export declare class ReLU implements Layer {
    layer: number[];
    init(network: Network, boundary: Boundary): Boundary;
}
