import Network, { BoundaryType } from '../Network';
export declare class ReLU {
    layer: number[];
    init(network: Network, boundary: BoundaryType): BoundaryType;
}
