export function childrenRef(index: number) {
  return function (target, propertyKey: string | symbol) {
    if (delete target[propertyKey]) {
      target.nameMapping = target.nameMapping || {}

      target.nameMapping[index] = propertyKey

      Object.defineProperty(target, propertyKey.toString(), {
        get: function () {
          return this.children[index] || null
        },
        set: function (value) {
          this.children[index] = value || null
          if (value) {
            value.parent = this
            if (value.stop && value.stop.offset > this.stop.offset) {
              this.stop = value.stop
            }
          }

        },
        enumerable: true
      })
    }
  }
}

export function indent(text: string): string {
  return text.replace(/^(.*)/gm, '  $1')
}

export abstract class Node {
  children: Node[] = []

  hasParenthesis: boolean = false

  nameMapping: { [i: number]: string }

  originalText: string

  constructor() {
    let originalToString = this.toString

    this.toString = () => {
      if (this.hasParenthesis)
        return '(' + originalToString.apply(this) + ')'
      return originalToString.apply(this)
    }
  }

  parent: Node

  addNode(node: Node) {
    if (!node) return
    node.parent = this
    this.children.push(node)
  }

  toString(): string {
    if (this.originalText) {
      return this.originalText
    }
    return this.children.map(x => x.toString()).join('\n')
  }

  get value(): string {
    return null
  }

  inspect() {
    let childrenInspected = this.children.map((x, i) => {
      let name = this.nameMapping && this.nameMapping[i]
      if (name) name = name + ': '
      else name = ''

      return name + (!x ? 'null' : x.inspect())
    }).join('\n')

    return (this as any).constructor.name +
      (this.value ? ' value=' + this.value : '')
      + ' [' + (
        childrenInspected ? '\n' + indent(childrenInspected) + '\n'
          : ''
      ) + ']'
  }
}


export function walkerBuilder(cb: (node: Node, atl: Node) => void | Node) {
  const leFn = function (node: Node, atl?: Node) {
    if (!atl) atl = node as any
    if (node) {
      let res = null
      res = cb.call(this, node, atl)

      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i]) {
            let res = leFn.call(this, node.children[i], atl)
            if (res && res instanceof Node) {
              node.children[i] = res
            }
          }
        }
      };

      return res
    }
  }

  return leFn
}
