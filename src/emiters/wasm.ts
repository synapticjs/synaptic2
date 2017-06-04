import { indent } from 'lysergic/dist/ast/helpers';
import * as nodes from 'lysergic/dist/ast/nodes';

export const comparisonMap = {
  '>': 'f64.gt',
  '>=': 'f64.ge',
  '<': 'f64.lt',
  '<=': 'f64.le',
  '==': 'f64.eq',
  '!=': 'f64.ne'
};

export const mathOperatorsMap = {
  '*': 'f64.mul',
  '/': 'f64.div',
  '+': 'f64.add',
  '-': 'f64.sub',
};

export function emit(node: nodes.Node) {
  if (node instanceof nodes.DocumentNode) {
    return `
(module
  (type $FUNCSIG$dd (func (param f64) (result f64)))
  (type $FUNCSIG$ddd (func (param f64 f64) (result f64)))
  (import "stdlib.Math" "exp" (func $exp (param f64) (result f64)))
  (import "stdlib.Math" "pow" (func $pow (param f64 f64) (result f64)))
  (import "stdlib.Math" "log" (func $log (param f64) (result f64)))
  (import "env" "rand" (func $rand (param f64) (result f64)))
  (import "env" "memory" (memory $0 256 256))
  (import "env" "table" (table 0 0 anyfunc))
  (import "env" "memoryBase" (global $memoryBase i32))
  (import "env" "tableBase" (global $tableBase i32))
${
      indent(
        node.children.filter(x => x instanceof nodes.FunctionNode)
          .map((x: nodes.FunctionNode) => `(export "${x.name}" (func $${x.name}))`)
          .join('\n')
      )}\n${
      indent(node.children.map(x => emit(x)).join('\n'))
      }
)`;
  } else if (node instanceof nodes.BinaryExpressionNode) {
    const isAssignment =
      ['=', '+=', '-=', '*=', '/='].indexOf(node.operator) != -1;

    const isComparison = node.operator in comparisonMap;
    const isPow = node.operator == '^';
    const isMath = node.operator in mathOperatorsMap;

    if (isAssignment) {
      if (node.lhs instanceof nodes.HeapReferenceNode) {
        return `(f64.store (i32.const ${node.lhs.position})\n${indent(emit(node.rhs))}\n)`;
      } else {
        return `<<<<< I DONT KNOW HOW TO ASSIGN TO NON HeapReferenceNode`;
      }
    } else if (isPow) {
      return `(call $pow\n${indent(emit(node.lhs))}\n${indent(emit(node.rhs))})`;
    } else if (isComparison) {
      return `(${comparisonMap[node.operator]}\n${indent(emit(node.lhs))}\n${indent(emit(node.rhs))}\n)`;
    } else if (isMath) {
      return `(${mathOperatorsMap[node.operator]}\n${indent(emit(node.lhs))}\n${indent(emit(node.rhs))}\n)`;
    } else {
      return `<<<<< UNKNOWN OPERATOR: ${node.operator}`;
    }
  } else if (node instanceof nodes.HeapReferenceNode) {
    return `(f64.load (i32.const ${node.position}))`;
  } else if (node instanceof nodes.FloatNumberNode) {
    return `(f64.const ${node.numericValue.toFixed(1)})`;
  } else if (node instanceof nodes.LayerNode) {
    return `(block ;;; Layer ${node.id} ;;;\n`
      + indent(node.children.map(x => emit(x)).join('\n'))
      + `\n) ;;; END Layer ${node.id} ;;;\n`;
  } else if (node instanceof nodes.UnitNode) {
    return `(block ;;; Unit ${node.id} ;;;\n`
      + indent(node.children.map(x => emit(x)).join('\n'))
      + `\n) ;;; END Unit ${node.id} ;;;\n`;
  } else if (node instanceof nodes.TernaryExpressionNode) {
    return `(if \n${indent(
      emit(node.condition) + '\n' +
      emit(node.truePart) + '\n' +
      emit(node.falsePart)) + '\n'
      })`;
  } else if (node instanceof nodes.UnaryExpressionNode) {
    switch (node.operator) {
      case '-':
        return `(f64.neg ${emit(node.rhs)})`;
      case 'exp':
        return `(call $exp ${emit(node.rhs)})`;
      case 'rand':
        return `(call $rand ${emit(node.rhs)})`;
      // case 'sqrt':
      //  return `(f64.sqrt ${emit(node.rhs)})`;
    }
  } else if (node instanceof nodes.FunctionNode) {
    return (
      `(func $${node.name}\n${
      indent(
        `(block ;;; Function "${node.name}" body ;;;\n${indent(emit(node.body))}\n) ;;; END Function "${node.name}" body ;;;`
      )}\n)`
    );
  }
  return '<<<<< CANNOT PRINT NODE: ' + node.constructor.toString();
};

export default emit;