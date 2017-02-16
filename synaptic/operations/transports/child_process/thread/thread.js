import * as events from '../constants';
import EventEmitter from 'events';

const eventEmitter = new EventEmitter();
process.on('message', ({type, data}) => eventEmitter.emit(type, data))
const sendMessage = (type, data) => process.send({type, data});

const functions = {};

eventEmitter.on(events.execute, ({fnName, id, args}) => {
    if (functions[id]) {
        Promise.resolve(functions[id])
            .then(fn => fn(...args))
            .then(res => sendMessage(events.executed(id), res))
            .catch(err => sendMessage(events.error, `function with name ${fnName} crashed; id was ${id}`));
    } else {
        sendMessage(events.error, `no function found with name ${fnName}; id was ${id}`)
    }
});

sendMessage(events.initialized);