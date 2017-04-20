import Network, { IBoundary, INetworkLayer } from '../Network';
export default class Dropout implements INetworkLayer {
    chances: number;
    gater: number[];
    layer: number[];
    constructor(chances: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
