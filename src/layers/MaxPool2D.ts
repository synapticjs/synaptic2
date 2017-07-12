import { Activations } from 'lysergic';
import Network, { Boundary, Layer } from '../Network';

export default class MaxPool2D implements Layer {

    gater: number[] = null;
    layer: number[] = null;

    constructor(public downsampling = 2) { }

    init(network: Network, boundary: Boundary): Boundary {

        if (boundary == null) {
            throw new Error('\'MaxPool2D\' can\'t be the first layer of the network!');
        }

        this.layer = network.addLayer();

        let fromX, fromY, fromZ, from, to;
        for (let z = 0; z < boundary.depth; z++) {
            for (let y = 0; y < boundary.height; y += this.downsampling) {
                for (let x = 0; x < boundary.width; x += this.downsampling) {

                    const unit = network.addUnit(Activations.ActivationTypes.MAX_POOLING, false);
                    this.layer.push(unit);

                    for (let offsetY = 0; offsetY < this.downsampling; offsetY++) {
                        for (let offsetX = 0; offsetX < this.downsampling; offsetX++) {

                            fromX = x + offsetX;
                            fromY = y + offsetY;
                            fromZ = z;

                            if (this.isValid(boundary, fromX, fromY, fromZ)) {

                                from = boundary.layer[fromX + fromY * boundary.height + fromZ * boundary.height * boundary.depth];
                                to = unit;

                                network.addConnection(from, to, 1);
                            }
                        }
                    }
                }
            }
        }

        // set the boundary for next layer
        return {
            width: Math.round(boundary.width / this.downsampling),
            height: Math.round(boundary.height / this.downsampling),
            depth: boundary.depth,
            layer: this.layer
        };
    }

    // returns true if the coords fall within the layer area
    isValid(boundary, x, y, z) {
        return x >= 0 &&
            x < boundary.width &&
            y >= 0 &&
            y < boundary.height &&
            z >= 0 &&
            z < boundary.depth;
    }
}
