export class Context {
    scope = new Map();
    get: (key: string) => any;

    constructor(scope, parent) {
        for (const key of Object.keys(scope))
            this.scope.set(key, scope[key]);

        const get = this.scope.get.bind(this.scope);


        this.get = parent
            ? (key) => get(key) || parent.get(key)
            : get;
    }

    assignOrDefine(key, value) {
        let target = this;

        while (target && !target.scope.has(key))
            target = target.parent;

        target = target || this;
        target.scope.set(key, value);
    }

    inherit(scope = {}) { return new this.constructor(scope, this) }

    interpret(expr) {
        switch (true) {
            case Array.isArray(expr):
                const [firstarg, ...rest] = expr;
                return call(this, firstarg, rest);
            case typeof expr === 'string':
                return this.get(expr) || expr;
            default:
                return expr;
        }
    }
}