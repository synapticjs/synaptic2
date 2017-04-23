import Network, { Boundary, Layer } from '../Network';
export default class Direct implements Layer {
    reverseInit(network: Network, boundary: Boundary): void;
}
