// import {Node} from '../../architect/ComputationGraph/util/graph';
const UniqueClassNameMap = new WeakMap();
const classNameClassMap = new Map();

export class Layer {
    static abstract = true;

    properties = {};
    graphNode = new Node(this);
    inputShape = null;
    outputShape = null;

    constructor(inputShape, outputShape) {
        this.inputShape = inputShape;
        this.outputShape = outputShape;
    }

    static get type() {
        if (UniqueClassNameMap.has(this))
            return UniqueClassNameMap.get(this);

        /*forced overload for layers extension*/
        if (this.layerName)
            return this.layerName;

        let name = this.name;
        if (!name || name.startsWith('_class')/*babel trick*/) {
            name = 'AnonymousLayer'
        }

        if (classNameClassMap.has(name)) {
            let id = 0;
            while (classNameClassMap.has(`${name}_${++id}`)) {}
            name = `${name}_${id}`;
        }

        classNameClassMap.set(name, this);
        UniqueClassNameMap.set(this, name);
        return name;
    }

    get type() { return this.constructor.type }

    toString() {
        const type = this.type;
        const shape = [this.inputShape, this.outputShape].map(shape => JSON.stringify(shape)).join(' => ');
        const props = Object.keys(this.properties) ? ` (${JSON.stringify(this.properties)})` : '';
        return `${type}<${shape}>${props}`;
    }

    toJSON() {
        return {...this.properties, type: this.type}
    }
}