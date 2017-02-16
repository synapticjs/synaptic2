const nonce = () => {};

const wrapCall = fn => {fn()};

type Fn = () => void | () => () => void;

export class Dependency {
    static nonce = nonce;

    constructor(fn: Fn, dependencies: Dependency[] = [], {lazy = false}: { lazy: boolean } = {}) {
        this.fn = fn;
        this.lazy = lazy;
        if (dependencies.includes(undefined))
            debugger;
        this.dependencies = dependencies;
    }

    _compileActions(deplist: Dependency[] = []): Dependency[] {
        if (deplist.includes(this))
            return [];

        if (this.dependencies.length === 0)
            return [this];

        let fulfilledDeps = [];
        for (const dependency of this.dependencies)
            fulfilledDeps = [...fulfilledDeps, ...dependency._compileActions([...deplist, ...fulfilledDeps])];
        return [...fulfilledDeps, this];
    }

    compile(): () => void {
        const actions = this._compileActions();
        const fns = actions.map(action => (action.lazy ? action.fn() : action.fn)).filter(fn => fn !== nonce);
        return Array.prototype.forEach.bind(fns, wrapCall)
    }

    join(dependency: Dependency): Dependency {
        return new Dependency(Dependency.nonce, [this, dependency]);
    }
}
