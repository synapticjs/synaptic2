import Network, { IBoundary, INetworkLayer } from '../Network';
export declare class ReLU implements INetworkLayer {
    layer: number[];
    init(network: Network, boundary: IBoundary): IBoundary;
}
