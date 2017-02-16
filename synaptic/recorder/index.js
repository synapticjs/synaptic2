class RecorderBase {
    allocationAst = [];
    operationsAst = [];

    get ast() { return [...this.allocationAst, ...this.operationsAst] }

    _pointerId = 0;

    _getPointer() { return this._pointerId++; }

    registerAllocation(pointer){ this.allocationAst.push(['allocate', pointer]); }

    registerOp(name, ...args){ this.operationsAst.push([name, ...args]); }

    dumpLocalComputationTree(callback) {
        const localMode = this.hasOwnProperty('registerAllocation');
        if (!localMode)
            this.registerAllocation = () => { throw new Error('cannot allocate in local computation tree')}
        const currentAst = this.operationsAst;
        const localAst = this.operationsAst = [];
        callback();
        this.operationsAst = currentAst;
        if (!localMode)
            //noinspection JSAnnotator
            delete this.registerAllocation;

        return localAst;
    }
}

class Pointer {
    constructor(shape) {
        this.shape = shape;
    }
}

export class Recorder extends RecorderBase {
    fn(internalFn) {
        const pointerId = this._getPointer();
        this.registerOp('defn', pointerId, this.dumpLocalComputationTree(internalFn));
        return () => this.registerOp(pointerId);
    }

    list(list) { this.registerOp('list', list) }

    pointer(shape) {
        const pointer = new Pointer(shape);
        this.registerAllocation(pointer);
        return pointer;
    }

    ones(pointer) { this.registerOp('ones', pointer) }

    blas = {
        copy: (to, from) => {
            this.registerOp('blas.copy', to, from)
        }
    }
}