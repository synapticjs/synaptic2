import Network, { BoundaryType } from '../Network';
export default class Dense {
    size: number;
    layer: number[];
    constructor(size: number);
    init(network: Network, boundary: BoundaryType): BoundaryType;
}
