import Dense from './Dense';
import { Topology, Activations } from "lysergic";

export default class Regression extends Dense {
  constructor(size: number, options: Topology.ITopologyUnitOptions = {}) {
    super(size, { ...options, activationFunction: Activations.ActivationTypes.IDENTITY, bias: false });
  }
}
