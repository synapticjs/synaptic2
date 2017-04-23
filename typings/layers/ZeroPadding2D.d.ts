import Network, { Boundary, Layer } from '../Network';
export default class ZeroPadding2D implements Layer {
    padding: number;
    layer: number[];
    constructor(padding: number);
    init(network: Network, boundary: Boundary): Boundary;
    isPadding(boundary: any, x: any, y: any, z: any): boolean;
}
