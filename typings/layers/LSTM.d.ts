import Network, { Boundary, Layer } from '../Network';
export default class LSTM implements Layer {
    memoryBlocks: number;
    peepholes: boolean;
    prevLayer: any;
    nextLayer: any;
    inputGate: any;
    forgetGate: any;
    memoryCell: any;
    outputGate: any;
    constructor(memoryBlocks: number, {peepholes}?: {
        peepholes: boolean;
    });
    init(network: Network, boundary: Boundary): Boundary;
    reverseInit(network: any, boundary: any): void;
}
