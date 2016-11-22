import Network, { BoundaryType } from '../Network';
export default class Dropout {
    chances: number;
    gater: number[];
    layer: number[];
    constructor(chances: number);
    init(network: Network, boundary: BoundaryType): BoundaryType;
}
