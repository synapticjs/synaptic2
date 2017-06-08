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
  'max': 'max',
  'min': 'min'
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

    let testSignature = module.addFunctionType(`test$$signature`, Binaryen.f64/*ret*/, [/*params*/]);
    let testFunction = module.addFunction(
      'test',
      testSignature,
      [/*params*/],
      module.return(
        module.f64.add(
          module.f64.load(0 /*offset */, 8, module.i32.const(0)),
          module.f64.load(0 /*offset */, 8, module.i32.const(8))
        )
      )
    );
    module.addExport('test', 'test');

    functions.push(testFunction);

    // console.log(node.inspect());
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
        if (node.operator == '=') {
          return module.f64.store(0, 8, module.i32.const(node.lhs.position * 8), emit(node.rhs, module));
        } else {
          let firstOperation = node.operator[0];
          const isMath = firstOperation in mathOperatorsMap;

          if (isMath) {
            let rhs = module.f64[mathOperatorsMap[firstOperation]](emit(node.lhs, module), emit(node.rhs, module));

            return module.f64.store(0, 8, module.i32.const(node.lhs.position * 8), rhs);
          }

          console.error(`<<<<< I DONT KNOW HOW TO EMIT ASSIGNMENT FOR ${node.operator}`);
        }
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
    return module.f64.load(0 /*offset */, 8 /* byte alignment */, module.i32.const(node.position * 8));
  } else if (node instanceof nodes.FloatNumberNode) {
    return module.f64.const(node.numericValue);
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
      case 'ln':
        return module.callImport("log", [emit(node.rhs, module)], Binaryen.f64);
      case 'abs':
        return module.f64.abs(emit(node.rhs, module));
      case 'sqrt':
        return module.f64.sqrt(emit(node.rhs, module));
    }
    console.error(`<<<<< UNKNOWN OPERATOR: ${node.operator}`);
    return module.nop();
  } else if (node instanceof nodes.BlockNode) {
    return module.block(node.name || ``, node.children.map(x => emit(x, module)));
  } else if (node instanceof nodes.FunctionNode) {
    let functionSignature = module.addFunctionType(`${node.name}$$signature`, Binaryen.None/*ret*/, [/*params*/]);

    // Create the function
    let theFunction = module.addFunction(node.name, functionSignature, [/*params*/], emit(node.body, module));
    module.addExport(node.name, node.name);

    return theFunction;
  }
  throw new Error('Cannot emit node ' + (node.constructor as any).name);
};

export default emit;