import Network, { BoundaryType } from '../Network';
export default class ZeroPadding {
    padding: number;
    layer: number[];
    constructor(padding: number);
    init(network: Network, boundary: BoundaryType): BoundaryType;
    isPadding(boundary: any, x: any, y: any, z: any): boolean;
}
