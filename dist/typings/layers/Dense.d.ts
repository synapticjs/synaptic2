import Network, { IBoundary, INetworkLayer } from '../Network';
export default class Dense implements INetworkLayer {
    size: number;
    layer: number[];
    constructor(size: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
