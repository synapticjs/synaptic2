import { indent } from 'lysergic/dist/ast/helpers';
import { nodes } from "lysergic";


function baseEmit(node: nodes.Node) {
  if (node instanceof nodes.DocumentNode) {
    return `"use asm";
var H = new stdlib.Float64Array(heap);
var exp = stdlib.Math.exp;
var pow = stdlib.Math.pow;
var ln = stdlib.Math.log;
var abs = stdlib.Math.abs;
var max = stdlib.Math.max;

${node.children.map(x => emit(x)).map(x => x + ';').join('\n')}

return {
  ${node.children.filter(x => x instanceof nodes.FunctionNode).map((x: nodes.FunctionNode) => x.name + ': ' + x.name).join(',\n  ')}
}`;
  } else if (node instanceof nodes.BinaryExpressionNode) {
    let lhsString = emit(node.lhs);
    let rhsString = emit(node.rhs);

    const isAssignment = node.operator in { '=': 1, '-=': 1, '+=': 1, '*=': 1, '/=': 1 };

    if (isAssignment) {
      if (node.lhs instanceof nodes.Variable) {
        lhsString = `H[${node.lhs.position}] /* ${node.lhs.key} */`;
      } else if (node.lhs instanceof nodes.HeapReferenceNode) {
        lhsString = `H[${node.lhs.position}]`;
      }
    }

    if (node.operator.length === 2 && node.operator[1] === '=' && node.operator != '==') {
      return `${lhsString} = \n` + indent(`${emit(node.lhs)} ${node.operator[0]} (\n${indent(rhsString)}\n)\n`);
    } else if (node.operator === '^') {
      return `pow(${emit(node.lhs)}, ${rhsString})`;
    } else if (node.operator === 'max') {
      return `max(${emit(node.lhs)}, ${rhsString})`;
    } else if (node.operator === '=') {
      return `${lhsString} = \n${indent(rhsString)}\n`;
    }
    return `${lhsString} ${node.operator} ${rhsString}`;
    // if `a += b` -> `a = a + (b)`
  } else if (node instanceof nodes.Variable) {
    if (node.hasParenthesis)
      return `+H[${node.position}] /* ${node.key} */`;
    else
      return `(+H[${node.position}] /* ${node.key} */)`;
  } else if (node instanceof nodes.HeapReferenceNode) {
    if (node.hasParenthesis)
      return `+H[${node.position}]`;
    else
      return `(+H[${node.position}])`;
  } else if (node instanceof nodes.FloatNumberNode) {
    return node.numericValue.toFixed(1);
  } else if (node instanceof nodes.TernaryExpressionNode) {
    return '(' + emit(node.condition) + ') ? (' + emit(node.truePart) + ') : (' + emit(node.falsePart) + ')';
  } else if (node instanceof nodes.UnaryExpressionNode) {
    return `${node.operator}(${emit(node.rhs)})`;
  } else if (node instanceof nodes.BlockNode) {
    return '/* ' + (node.name || 'Unnamed block') + ' */\n' + indent(node.children.map(x => emit(x) + ';').join('\n')) + '\n';
  } else if (node instanceof nodes.FunctionNode) {
    return `function ${node.name}() {
  ${indent(emit(node.body))}
}`;
  }
  return 'CANNOT PRINT NODE: ' + node.constructor.toString();
};

export default function emit(node: nodes.Node) {
  if (node.hasParenthesis)
    return '(' + baseEmit.call(null, node) + ')';
  return baseEmit.call(null, node);
}