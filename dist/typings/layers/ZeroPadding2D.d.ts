import Network, { IBoundary, INetworkLayer } from '../Network';
export default class ZeroPadding2D implements INetworkLayer {
    padding: number;
    layer: number[];
    constructor(padding: number);
    init(network: Network, boundary: IBoundary): IBoundary;
    isPadding(boundary: any, x: any, y: any, z: any): boolean;
}
