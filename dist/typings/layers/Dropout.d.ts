import Network, { IBoundary } from '../Network';
export default class Dropout {
    chances: number;
    gater: number[];
    layer: number[];
    constructor(chances: number);
    init(network: Network, boundary: IBoundary): IBoundary;
}
