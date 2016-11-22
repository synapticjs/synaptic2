import Network, { BoundaryType } from '../Network';
export default class MaxPool3D {
    downsampling: number;
    gater: number[];
    layer: number[];
    constructor(downsampling?: number);
    init(network: Network, boundary: BoundaryType): BoundaryType;
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
