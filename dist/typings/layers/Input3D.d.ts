import Network, { IBoundary, INetworkLayer } from '../Network';
export default class Input3D implements INetworkLayer {
    width: number;
    height: number;
    depth: number;
    layer: number[];
    constructor(width: number, height: number, depth: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
