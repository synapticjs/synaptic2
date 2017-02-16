//@flow

import {Variable as Var} from '../Variable';
import {Dependency} from './orchestrator/';
import {flatten} from 'ramda';
export {Dependency} from './orchestrator/';

export class OperationDependency extends Dependency {
    static extractVariables(dependency: Dependency): Var[] {
        const actions = dependency._compileActions();
        const varsSet: Var[] = flatten(actions.map(({variablesUsed}) => variablesUsed || []));

        //to uniq
        return Array.from(new Set(varsSet));
    }

    variablesUsed: Var[];
    name: ?string;

    constructor(fn: () => any, vars: Var[], name?: string) {
        const _fn = () => fn.bind(null, ...vars.map(v => v.pointer || v));

        super(
            Object.defineProperties(_fn, {name: {value: fn.name}}),
            vars.map(v => v.stateDependency),
            {lazy: true});
        //this is dirty hack and should be fixed
        vars.forEach(v => v.registerManipulation(this));

        this.variablesUsed = vars;
        this.name = name;
    }
}