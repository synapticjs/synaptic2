import Network, { IBoundary, INetworkLayer } from '../Network';
export default class MaxPool3D implements INetworkLayer {
    downsampling: number;
    gater: number[];
    layer: number[];
    constructor(downsampling?: number);
    init(network: Network, boundary: IBoundary): IBoundary;
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
