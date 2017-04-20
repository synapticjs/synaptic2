import Network, { IBoundary, INetworkLayer } from '../Network';
export default class LSTM implements INetworkLayer {
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
    init(network: Network, boundary: IBoundary): IBoundary;
    reverseInit(network: any, boundary: any): void;
}
