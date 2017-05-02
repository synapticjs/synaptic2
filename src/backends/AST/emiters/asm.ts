import AST = require('..')
import nodes = require('../nodes')

let emit = (node: AST.Node) => {
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
      return `H[${node.lhs.position}] ${node.operator} ${emit(node.rhs)}`
    }
    return `${emit(node.lhs)} ${node.operator} ${emit(node.rhs)}`
    // if `a += b` -> `a = a + (b)` 
  } else if (node instanceof nodes.HeapReferenceNode) {
    return `(+H[${node.position}])`
  } else if (node instanceof nodes.FloatNumberNode) {
    return node.numericValue.toFixed(1)
  } else if (node instanceof nodes.LayerNode) {
    return `// Layer ${node.id}\n`
      + AST.indent(node.children.map(x => x + ';').join('\n'))
      + '\n'
  } else if (node instanceof nodes.UnitNode) {
    return `// Unit ${node.id}\n`
      + AST.indent(node.children.map(x => x + ';').join('\n'))
      + '\n'
  } else if (node instanceof nodes.TernaryExpressionNode) {
    return emit(node.condition) + ' ? ' + emit(node.truePart) + ' : ' + emit(node.falsePart)
  }
  return 'CANNOT PRINT NODE: ' + node.constructor.toString()
}

emit = (node: AST.Node) => {
  if (node.hasParenthesis)
    return '(' + emit.call(null, node) + ')'
  return emit.call(null, node)
}

export default emit