import * as nodes from 'lysergic/dist/ast/nodes';

declare var require, console;
const Binaryen = require('../../vendor/binaryen');

export const comparisonMap = {
  '>': 'gt',
  '>=': 'ge',
  '<': 'lt',
  '<=': 'le',
  '==': 'eq',
  '!=': 'ne'
};

export const mathOperatorsMap = {
  '*': 'mul',
  '/': 'div',
  '+': 'add',
  '-': 'sub',
};

export function emit(node: nodes.Node, module) {
  if (!(node instanceof nodes.DocumentNode) && !module) {
    throw new Error('A module is required');
  }

  if (node instanceof nodes.DocumentNode) {
    if (!module) module = new Binaryen.Module();

    let fiF = module.addFunctionType("fiF", Binaryen.f64, [Binaryen.f64]);
    let fiFF = module.addFunctionType("fiFF", Binaryen.f64, [Binaryen.f64, Binaryen.f64]);

    module.addImport("exp", "imports", "exp", fiF);
    module.addImport("log", "imports", "log", fiF);
    module.addImport("pow", "imports", "pow", fiFF);

    let functions = node.children.filter($ => $ instanceof nodes.FunctionNode).map(x => emit(x, module));

    module.setFunctionTable(functions);

    return module;
  } else if (node instanceof nodes.BinaryExpressionNode) {
    const isAssignment =
      ['=', '+=', '-=', '*=', '/='].indexOf(node.operator) != -1;

    const isComparison = node.operator in comparisonMap;
    const isPow = node.operator == '^';
    const isMath = node.operator in mathOperatorsMap;

    if (isAssignment) {
      if (node.lhs instanceof nodes.HeapReferenceNode) {
        return module.f64.store(0, 8, module.i32.const(node.lhs.position), emit(node.rhs, module));
      } else {
        console.error(`<<<<< I DONT KNOW HOW TO ASSIGN TO NON HeapReferenceNode`);
        return module.nop();
      }
    } else if (isPow) {
      return module.callImport("pow", [emit(node.lhs, module), emit(node.rhs, module)], Binaryen.f64);
    } else if (isComparison) {
      return module.f64[comparisonMap[node.operator]](emit(node.lhs, module), emit(node.rhs, module));
    } else if (isMath) {
      return module.f64[mathOperatorsMap[node.operator]](emit(node.lhs, module), emit(node.rhs, module));
    } else {
      console.error(`<<<<< UNKNOWN OPERATOR: ${node.operator}`);
      return module.nop();
    }


  } else if (node instanceof nodes.HeapReferenceNode) {
    return module.f64.load(0 /*offset */, 8, module.i32.const(node.position));
  } else if (node instanceof nodes.FloatNumberNode) {
    return module.f64.const(node.numericValue);
  } else if (node instanceof nodes.LayerNode) {
    return module.block(`Layer${node.id}`, node.children.map(x => emit(x, module)));
  } else if (node instanceof nodes.UnitNode) {
    return module.block(`Unit${node.id}`, node.children.map(x => emit(x, module)));
  } else if (node instanceof nodes.TernaryExpressionNode) {
    return module.if(
      emit(node.condition, module),
      emit(node.truePart, module),
      emit(node.falsePart, module)
    );
  } else if (node instanceof nodes.UnaryExpressionNode) {
    switch (node.operator) {
      case '-':
        return module.f64.neg(emit(node.rhs, module));
      case 'exp':
        return module.callImport("exp", [emit(node.rhs, module)], Binaryen.f64);
      case 'rand':
        return module.callImport("rand", [emit(node.rhs, module)], Binaryen.f64);
      // case 'sqrt':
      //  return `(f64.sqrt ${emit(node.rhs)})`;
    }
    console.error(`<<<<< UNKNOWN OPERATOR: ${node.operator}`);
    return module.nop();
  } else if (node instanceof nodes.FunctionNode) {
    let functionSignature = module.addFunctionType(`${node.name}$$signature`, Binaryen.None/*ret*/, [/*params*/]);


    let block = module.block(`BodyOf${node.name}`, node.children.map(x => emit(x, module)));
    // emit(node.children, module)

    // Create the function
    let theFunction = module.addFunction(node.name, functionSignature, [/*params*/], block);
    module.addExport(node.name, node.name);

    // if (node.name == 'propagate') {
    //   console.log(node.inspect())
    //   console.log(Binaryen.emitText(block));
    // }

    return theFunction;
  }
  throw new Error('Cannot emit node ' + (node.constructor as any).name);
};

export default emit;