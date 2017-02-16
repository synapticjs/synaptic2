import {fork} from 'child_process';

export default async function (expr, data) {
    const child = fork(__dirname + '/thread.js');
    const message = await new Promise(res => child.on('message', res));
    if (message.status !== 'ready')
        throw new Error('child process is not ready');

    child.send({expr, data});
    return fn => child.on('message', ({data}) => fn(data));
}