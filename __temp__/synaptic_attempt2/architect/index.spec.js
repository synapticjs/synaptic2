// @flow
/*
 Minute of theory.
 Any NN is acyclic oriented graph.
 This is very important:
 We can consider that all nodes without an incoming edges are either Input nodes or GenerativeInput nodes (e.g. noize).
 We can consider that al nodes without an outcoming edges are either Output nodes or dead nodes.
 We can decompose any computation graph into set of edges and set or nodes.
 Any node is representing some layer type.
 Some layers are vanishing, like "sequential" layer.
 */
import {expect} from 'chai';
import {Architect, SingleInputLayer as Layer, Layer as MultiInputLayer} from './';
import * as layerNames from '../constants/layerNames';

const initialLayers = {...Architect.layers};

describe('Architect', () => {
	beforeEach(() => Architect.layers = {...initialLayers})

	it('should compose a no-layer network', () => {
		const architect = new Architect({
			inputs: [
				[1, 10]
			],
			outputs: [
				[1, 10]
			]
		});

		architect.connect(architect.inputs[0], architect.outputs[0]);

		expect(architect.dump()).to.deep.equal({
			nodes: [
				{type: layerNames.input},
				{type: layerNames.output}
			],
			edges: [
				{from: 0, to: 1, shape: [1, 10], input: 0}
			]
		})
	})

	it('should compose a network with custom layer', () => {
		class TransposeLayer extends Layer {
			static type = 'transpose';

			pipe_shape([s0, s1]) { return [s1, s0] };
		}

		expect(TransposeLayer).to.have.property('type', 'transpose');
		Architect.registerNode(TransposeLayer);

		expect(Architect.getType(TransposeLayer)).to.equal(TransposeLayer.type);

		const architect = new Architect({
			inputs: [
				[1, 10]
			],
			outputs: [
				[10, 1]
			]
		});
		const layer = new TransposeLayer({
			inputShape: [1, 10],
			outputShape: [10, 1],
		});
		architect.connect(architect.inputs[0], layer);
		architect.connect(layer, architect.outputs[0]);

		expect(architect.dump()).to.deep.equal({
			nodes: [
				{type: layerNames.input},
				{type: layerNames.output},
				{type: TransposeLayer.type}
			],
			edges: [
				{from: 0, to: 2, shape: [1, 10], input: 0},
				{from: 2, to: 1, shape: [10, 1], input: 0}
			]
		})
	})

	it('should associate a specific id with layer', () => {
		class TransposeLayer extends Layer {
			static type = 'transpose';

			pipe_shape([s0, s1]) { return [s1, s0] }
		}

		expect(TransposeLayer).to.have.property('type', 'transpose');
		Architect.registerNode(TransposeLayer);

		expect(Architect.getType(TransposeLayer)).to.equal(TransposeLayer.type);

		const architect = new Architect({
			inputs: [
				[1, 10]
			],
			outputs: [
				[10, 1]
			]
		});
		const layer = new TransposeLayer({
			inputShape: [1, 10],
			outputShape: [10, 1],
		});
		architect.connect(architect.inputs[0], layer);
		architect.connect(layer, architect.outputs[0]);

		expect(architect.dump()).to.deep.equal({
			nodes: [
				{type: layerNames.input},
				{type: layerNames.output},
				{type: TransposeLayer.type}
			],
			edges: [
				{from: 0, to: 2, shape: [1, 10], input: 0},
				{from: 2, to: 1, shape: [10, 1], input: 0}
			]
		})
	})

	it('should crash a network with custom layer in improper shape', () => {
		class ImproperShapeLayer extends Layer {
			pipe_shape([s0, s1]) { return [s1, s0] }
		}

		Architect.registerNode(ImproperShapeLayer);
		expect(ImproperShapeLayer).to.have.property('type', 'ImproperShapeLayer');
		expect(Architect.getType(ImproperShapeLayer)).to.equal(ImproperShapeLayer.type);

		const architect = new Architect({
			inputs: [
				[1, 10]
			],
			outputs: [
				[1, 10]
			]
		});
		expect(() => new ImproperShapeLayer({
			inputShape: [1, 10],
			outputShape: [20, 5],
		})).to.throw(TypeError);

		const layer = new ImproperShapeLayer({
			inputShape: [1, 10],
			outputShape: [10, 1],
		});

		architect.connect(architect.inputs[0], layer);
		expect(() => architect.connect(layer, architect.outputs[0])).to.throw(TypeError);
	})

	it('should support a multi-input layer', () => {
		class MergeLayer extends MultiInputLayer {
			pipe_shape([s00, s01], [s10, s11]) {
				if (s00 !== s10)
					throw new TypeError();

				return [s00, s01 + s11];
			}
		}

		Architect.registerNode(MergeLayer);

		const architect = new Architect({
			inputs: [
				[1, 10],
				[1, 20],
			],
			outputs: [
				[1, 30]
			]
		});
		const layer = new MergeLayer({
			inputShapes: [[1, 10], [1, 20]],
			outputShape: [1, 30]
		});

		architect.connect(architect.inputs[0], layer, {input: 0});
		architect.connect(architect.inputs[1], layer, {input: 1});
		architect.connect(layer, architect.outputs[0]);
		expect(architect.dump()).to.deep.equal({
			nodes: [
				{type: layerNames.input},
				{type: layerNames.input},
				{type: layerNames.output},
				{type: MergeLayer.type}
			],
			edges: [
				{from: 0, to: 3, shape: [1, 10], input: 0},
				{from: 1, to: 3, shape: [1, 20], input: 1},
				{from: 3, to: 2, shape: [1, 30], input: 0}
			]
		})
	})

	it('should support a multi-output layer', () => {
		const architect = new Architect({
			inputs: [
				[1, 10],
			],
			outputs: [
				[1, 10],
				[1, 10]
			]
		});
		const layer = new Layer({
			inputShape: [1, 10],
			outputShape: [1, 10]
		});

		architect.connect(architect.inputs[0], layer);
		architect.connect(layer, architect.outputs[0]);
		architect.connect(layer, architect.outputs[1]);
		expect(architect.dump()).to.deep.equal({
			nodes: [
				{type: layerNames.input},
				{type: layerNames.output},
				{type: layerNames.output},
				{type: Layer.type}
			],
			edges: [
				{from: 0, to: 3, shape: [1, 10], input: 0},
				{from: 3, to: 1, shape: [1, 10], input: 0},
				{from: 3, to: 2, shape: [1, 10], input: 0}
			]
		})
	})
})