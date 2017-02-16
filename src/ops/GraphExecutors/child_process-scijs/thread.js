const {Interpreter} = require('../../common/lisp');

process.send({status: 'ready'});
process.once('message', ({expr, data}) => {
    const interpreter = new Interpreter(Interpreter.stdlib);

    interpreter.stdout.on('data', data => process.send({data}));
    process.on('message', ({data}) => interpreter.stdin.write(data));

    interpreter.interpret(expr);

    if (Array.isArray(data))
        data.forEach(entry => interpreter.stdin.write(entry));
});