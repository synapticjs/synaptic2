import Network, { BoundaryType } from '../Network';
export default class Input2D {
    width: number;
    height: number;
    layer: number[];
    constructor(width: number, height: number);
    init(network: Network, boundary: BoundaryType): BoundaryType;
}
