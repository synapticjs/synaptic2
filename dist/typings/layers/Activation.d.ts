import Network, { IBoundary } from '../Network';
export declare class ReLU {
    layer: number[];
    init(network: Network, boundary: IBoundary): IBoundary;
}
