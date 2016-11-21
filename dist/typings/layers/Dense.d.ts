import Network, { IBoundary } from '../Network';
export default class Dense {
    size: number;
    layer: number[];
    constructor(size: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
