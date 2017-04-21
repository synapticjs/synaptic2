import Network, { IBoundary, INetworkLayer } from '../Network';
export default class Input2D implements INetworkLayer {
    width: number;
    height: number;
    layer: number[];
    constructor(width: number, height: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
