import { Node, childrenRef } from '.'

export type BinaryOperator = '+' | '-' | '/' | '*' | '=' | '*=' | '/=' | '+=' | '-=' | '^'
export type UnaryOperator = '-' | 'exp'

export class ExpressionNode extends Node { }

export class ParametersNode extends Node {
  children: ExpressionNode[]

  toString() {
    return `(${this.children.join(', ')})`
  }
}


export class DocumentNode extends Node {
  children: ExpressionNode[]

  toString() {
    return this.children.join(';\n')
  }
}



export class HeapReferenceNode extends ExpressionNode {
  constructor(public position: number) {
    super()
  }

  toString() {
    return `H[${this.position}]`
  }
}

export class VariableReferenceNode extends ExpressionNode {
  constructor(public variableName: string) {
    super()
  }

  toString() {
    return this.variableName
  }
}

export class FunctionCallNode extends ExpressionNode {
  @childrenRef(0)
  fn: ExpressionNode

  @childrenRef(1)
  fnParameters: ParametersNode

  toString() {
    return this.fn.toString() + this.fnParameters.toString()
  }
}

export class BinaryExpressionNode extends ExpressionNode {
  @childrenRef(0)
  lhs: ExpressionNode

  @childrenRef(1)
  rhs: ExpressionNode

  constructor(public operator: BinaryOperator) {
    super()
  }

  toString() {
    switch (this.operator) {
      case "^":
        return `Math.pow(${this.lhs}, ${this.rhs})`
    }
    return this.lhs.toString() + ' ' + this.operator + ' ' + this.rhs.toString()
  }
}

export class UnaryExpressionNode extends ExpressionNode {
  @childrenRef(0)
  rhs: ExpressionNode

  constructor(public operator: UnaryOperator) {
    super()
  }

  toString() {
    return this.operator + '(' + this.rhs.toString() + ')'
  }
}

export class FloatNumberNode extends ExpressionNode {
  constructor(public numericValue: number) {
    super()
  }

  toString() {
    return this.numericValue.toFixed(1)
  }
}


export function heap(position: number) {
  return new HeapReferenceNode(position | 0)
}

export function number(floatingNumber: number) {
  return new FloatNumberNode(floatingNumber)
}

export function assign(target: HeapReferenceNode, rhs: ExpressionNode) {
  return binaryOp(target, '=', rhs)
}

export function assignMul(target: HeapReferenceNode, rhs: ExpressionNode) {
  return binaryOp(target, '*=', rhs)
}

export function assignSum(target: HeapReferenceNode, rhs: ExpressionNode) {
  return binaryOp(target, '+=', rhs)
}

export function assignSub(target: HeapReferenceNode, rhs: ExpressionNode) {
  return binaryOp(target, '-=', rhs)
}

export function assignDiv(target: HeapReferenceNode, rhs: ExpressionNode) {
  return binaryOp(target, '/=', rhs)
}

export function sum(lhs: ExpressionNode, rhs: ExpressionNode) {
  let bo = binaryOp(lhs, '+', rhs)
  bo.hasParenthesis = true
  return bo
}

export function pow(lhs: ExpressionNode, rhs: ExpressionNode) {
  let bo = binaryOp(lhs, '^', rhs)
  bo.hasParenthesis = true
  return bo
}

/** Substraction */
export function sub(lhs: ExpressionNode, rhs: ExpressionNode) {
  let bo = binaryOp(lhs, '-', rhs)
  bo.hasParenthesis = true
  return bo
}

/** Multiplication */
export function mul(lhs: ExpressionNode, rhs: ExpressionNode) {
  return binaryOp(lhs, '*', rhs)
}

/** Division */
export function div(lhs: ExpressionNode, rhs: ExpressionNode) {
  return binaryOp(lhs, '/', rhs)
}

/** Math.exp the argument `exp(rhs)` */
export function exp(rhs: ExpressionNode) {
  return unaryOp('exp', rhs)
}

/** Negates the argument `-rhs` */
export function neg(rhs: ExpressionNode) {
  return unaryOp('-', rhs)
}

export function binaryOp(lhs: ExpressionNode, op: BinaryOperator, rhs: ExpressionNode) {
  let node = new BinaryExpressionNode(op)
  node.lhs = lhs
  node.rhs = rhs
  return node
}

export function unaryOp(op: UnaryOperator, rhs: ExpressionNode) {
  let node = new UnaryExpressionNode(op)
  node.rhs = rhs
  return node
}


export function document(...args: ExpressionNode[]) {
  let node = new DocumentNode()
  for (let i of args) {
    if (i) {
      node.children.push(i)
    }
  }
  return node
}


declare var console
let ast = document(
  assign(heap(0), div(sum(mul(heap(1), number(1)), exp(heap(3))), pow(heap(5), number(3)))),
  assign(heap(1), number(3)),
  assign(heap(2), exp(mul(heap(1), heap(0))))
)
console.log('generated\n' + ast.toString())
console.log('tree', ast.inspect())