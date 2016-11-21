import Network, { IBoundary } from '../Network';
export default class Input2D {
    width: number;
    height: number;
    layer: number[];
    constructor(width: number, height: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
