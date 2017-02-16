//todo rename architect into architecture
import {Pointer} from '../pointers';
export {Layer, SingleInputLayer} from './Layer';
export {Architect} from './Architect';

export type Edge = {
	fromLayer: Node,
	toLayer: Node,
	shape: Shape,
	input: number,
}

export type Node = {
	pointers: Pointer[],
	inputs: Edge[] | null,
	output: Edge | null
}

type InputNode = {
	inputs: null,
	output: Edge | null
}

type OutputNode = {
	inputs: Edge[],
	output: null
}

export type Architect = {
	inputs: InputNode[],
	outputs: OutputNode[],
	connect(inputNode: Node, outputNode: Node): void,
}
