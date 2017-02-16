// @flow
import * as R from 'ramda';
import {Layer as Node} from '../Layer';
import {InputLayer as InputNode} from './InputLayer';
import {OutputLayer as OutputNode} from './OutputLayer';

type ArchitectInit = {
	inputs: Shape[],
	outputs: Shape[]
}

class Edge {
	fromNode: Node;
	toNode: Node;
	shape: Shape;
	input: ?number;

	constructor(fromNode, toNode, {input = 0} = {}) {
		const incomingShape = fromNode.outputShape;
		const outcomingShape = toNode.inputShapes[input];
		if (!incomingShape || !outcomingShape || !R.equals(incomingShape, outcomingShape))
			throw new TypeError();

		this.input = input;
		this.fromNode = fromNode;
		this.toNode = toNode;
		this.shape = incomingShape;
	}
}

export class Architect {
	static layersMap: WeakMap<Class<Node>, string> = new WeakMap();
	static layers: {[key: string]: Class<Node>} = {};


	static getType(layerConstructor: Class<Node>) { return this.layersMap.get(layerConstructor) }

	static registerNode(layer: Class<Node>) {
		if (this.layers[layer.type] && this.layers[layer.type] !== layer) {
			throw new Error();
		}

		this.layersMap.set(layer, layer.type);
		this.layers[layer.type] = layer;
	}

	inputs: InputNode[];
	outputs: OutputNode[];

	nodes: Set<Node> = new Set();
	edges: Set<Edge> = new Set();

	constructor({inputs, outputs}: ArchitectInit) {
		this.inputs = inputs.map(shape => new InputNode(shape));
		this.outputs = outputs.map(shape => new OutputNode(shape));
		for (const layer of this.inputs)
			this.registerNode(layer)
		for (const layer of this.outputs)
			this.registerNode(layer)
	}

	registerNode(layer: Node) {
		this.nodes.add(layer);
	}


	connect(fromNode: Node, toNode: Node, params: Object): void {
		this.edges.add(new Edge(fromNode, toNode, params))
		this.registerNode(fromNode)
		this.registerNode(toNode)
	}

	//todo drop
	dump(): {
		nodes: Object[],
		edges: Object[],
	} {
		const layers = Array.from(this.nodes);
		const layer_ids = new WeakMap();
		layers.forEach((layer, i) => layer_ids.set(layer, i));

		const nodes = layers.map(layer => layer.dump());

		const edges = Array.from(this.edges)
			.map(edge => ({
				from: layer_ids.get(edge.fromNode),
				to: layer_ids.get(edge.toNode),
				shape: edge.shape,
				...(edge.input !== undefined ? {input: edge.input} : {})
			}));

		return {nodes, edges};
	}
}

Architect.registerNode(InputNode);
Architect.registerNode(OutputNode);