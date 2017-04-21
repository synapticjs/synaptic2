import Network, { IBoundary, INetworkLayer } from '../Network';
export default class Input implements INetworkLayer {
    size: number;
    constructor(size: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
