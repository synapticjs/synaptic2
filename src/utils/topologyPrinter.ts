import Network from "../Network";
import { Activations } from "lysergic";

export function logTopology(network: Network) {
  let networkString = ['(Output)'];

  network.boundaries.forEach(boundary => {
    let activationTypes = {};

    boundary.layer.forEach(unit => {
      let at = Activations.ActivationTypes[network.compiler.topology.activationFunction[unit]];
      activationTypes[at] = (activationTypes[at] || 0) + 1;
    });

    let atString = '';

    Object.keys(activationTypes).map($ => atString = atString + ' ' + $ + 'x' + activationTypes[$]);

    networkString.push(`  [${boundary.width}x${boundary.height}x${boundary.depth}]${atString}`);
  });

  networkString.push('(Input)');

  networkString.reverse();

  return networkString.join('\n');
}