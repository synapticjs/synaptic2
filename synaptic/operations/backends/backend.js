import {Pointer} from '../';
type BackendInit = {
    log: ?(pointer: Pointer) => any
};

export class Backend {
    name: string;

    constructor({log}: BackendInit = {}) {
        if (this.constructor === Backend)
            throw new Error('cannot instantate abstract backend class directly')

        this.log = log;
    }

    compile(ast: AST): Runner {

    }
}