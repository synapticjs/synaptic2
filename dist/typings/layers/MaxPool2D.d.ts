import Network, { IBoundary } from '../Network';
export default class MaxPool2D {
    downsampling: number;
    gater: number[];
    layer: number[];
    constructor(downsampling?: number);
    init(network: Network, boundary: IBoundary): IBoundary;
    isValid(boundary: any, x: any, y: any, z: any): boolean;
}
