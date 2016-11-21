import Network, { IBoundary } from '../Network';
export default class Input {
    size: number;
    layer: number[];
    constructor(size: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
