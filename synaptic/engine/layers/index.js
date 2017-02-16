//@flow
export {Bias} from './bias';
export {Input} from './input';
export {Flatten} from './flatten';
export {Dense} from './dense';
export {Activation} from './activation';
export {Merge1d} from './merge1d';
export {Output} from './output';

// note: we need to implement splitLayer for splits - we cannot simply take outputs directly,
// instead should use splitter of (n, m) => (count, n, m), and then take (1, n, m)... etc
// this is needed for backprop purposes