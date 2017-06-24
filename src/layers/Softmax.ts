import Dense from './Dense';
import { Topology, Activations } from "lysergic";

export default class Softmax extends Dense {
  constructor(size: number, options: Topology.ITopologyUnitOptions = {}) {
    super(size, { ...options, activationFunction: Activations.ActivationTypes.SOFTMAX, bias: false });
  }
}
