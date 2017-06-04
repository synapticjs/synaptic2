import { indent } from 'lysergic/dist/ast/helpers';
import * as nodes from 'lysergic/dist/ast/nodes';

const binaryOperation = (lhs, operator, rhs) => {
  if (operator.length === 2 && operator[1] === '=') {
    return `${lhs} = ${lhs} ${operator[0]} (${rhs})`;
  } else if (operator === '^') {
    return `${lhs} = pow(${lhs}, ${rhs})`;
  } else if (operator === '=') {
    return `${lhs} = ${rhs}`;
  }
  return `${lhs} ${operator} (${rhs})`;
};

function baseEmit(node: nodes.Node) {
  if (node instanceof nodes.DocumentNode) {
    return `"use asm";
var H = new stdlib.Float64Array(heap);
var exp = stdlib.Math.exp;
var pow = stdlib.Math.pow;
var random = foreign.random;

${node.children.map(x => emit(x)).map(x => x + ';').join('\n')}

return {
  ${node.children.filter(x => x instanceof nodes.FunctionNode).map((x: nodes.FunctionNode) => x.name + ': ' + x.name).join(',\n  ')}
}`
  } else if (node instanceof nodes.BinaryExpressionNode) {
    if (node.lhs instanceof nodes.HeapReferenceNode) {
      return binaryOperation(`H[${node.lhs.position}]`, node.operator, emit(node.rhs));
    }
    return binaryOperation(emit(node.lhs), node.operator, emit(node.rhs));
    // if `a += b` -> `a = a + (b)` 
  } else if (node instanceof nodes.HeapReferenceNode) {
    return `(+H[${node.position}])`;
  } else if (node instanceof nodes.FloatNumberNode) {
    return node.numericValue.toFixed(1);
  } else if (node instanceof nodes.LayerNode) {
    return `// Layer ${node.id}\n`
      + indent(node.children.map(x => emit(x) + ';').join('\n'))
      + '\n';
  } else if (node instanceof nodes.UnitNode) {
    return `// Unit ${node.id}\n`
      + indent(node.children.map(x => emit(x) + ';').join('\n'))
      + '\n';
  } else if (node instanceof nodes.TernaryExpressionNode) {
    return emit(node.condition) + ' ? ' + emit(node.truePart) + ' : ' + emit(node.falsePart)
  } else if (node instanceof nodes.UnaryExpressionNode) {
    return `${node.operator}(${emit(node.rhs)})`;
  } else if (node instanceof nodes.FunctionNode) {
    return `function ${node.name}() {
  ${emit(node.body)}
}`;
  }
  return 'CANNOT PRINT NODE: ' + node.constructor.toString();
};

export default function emit(node: nodes.Node) {
  if (node.hasParenthesis)
    return '(' + baseEmit.call(null, node) + ')';
  return baseEmit.call(null, node);
}