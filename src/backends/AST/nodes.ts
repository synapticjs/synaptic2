import { Node, childrenRef } from '.'

export type BinaryOperator = '+' | '-' | '/' | '*' | '=' | '*=' | '/=' | '+=' | '-=' | '^' | '>' | '<' | '>=' | '<=' | '=='
export type UnaryOperator = '-' | 'exp' | 'rand'

export class ExpressionNode extends Node { }

export class ParametersNode extends Node {
  children: ExpressionNode[]

  toString() {
    return `(${this.children.join(', ')})`
  }
}


export class DocumentNode extends Node {
  children: ExpressionNode[]
  add(expression: ExpressionNode) {
    return this.children.push(expression)
  }
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

export class TernaryExpressionNode extends ExpressionNode {
  @childrenRef(0)
  condition: ExpressionNode

  @childrenRef(1)
  truePart: ExpressionNode

  @childrenRef(2)
  falsePart: ExpressionNode

  constructor() {
    super()
  }

  toString() {
    return this.condition.toString() + ' ? ' + this.truePart.toString() + ' : ' + this.falsePart.toString()
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