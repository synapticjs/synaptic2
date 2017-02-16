import {fork} from 'child_process';
import EventEmitter from 'events';
import {EVENTS} from './constants';

const generator = (i = 0) => () => i++;

export default class ChildProcessTransport {
    _child = fork(__dirname + '/thread.launcher.js');
    _emitter = new EventEmitter();

    _on = this._emitter.on.bind(this._emitter);
    _off = this._emitter.off.bind(this._emitter);
    _once = this._emitter.once.bind(this._emitter);

    _ready = new Promise(res => this._once(EVENTS.initialized, res));

    _idGenerator = generator();

    constructor() {
        this._child.on('message', ({type, data}) => this._emitter.emit(data));
        this._on('error', err => console.error(`error happened in ${this.constructor.name}`, err))
    }

    _send(type, data) {
        this._ready.then(() => this._child._send({type, data}));
    }

    _execute(fnName, ...args) {
        return new Promise((res, rej) => {
            const id = this._idGenerator();
            this._send({type: EVENTS.execute, data: {fnName, id, args}})
            this._once(EVENTS.executed(id), ([err, data]) => err ? rej(err) : res(data));
        })
    }
}