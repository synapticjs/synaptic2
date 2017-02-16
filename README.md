# Synaptic 2
---
*API state: working draft*

*library state: in active development. Description is mostly more a plan of work*

**Synaptic 2** is a fully-featured multi-backend **JavaScript** neural network framework.

It aims to be to **JS** world what **Keras** is to world of **Python**.

It works in **Node.js**, in **any modern browser** 
and can be theoretically ran everywhere where JS is available: 
from Espruino microcontroller to MongoDB.

**Synaptic 2** adopts the best practices - 
automatic differentiation, build of computation graph, multiple computational backends, 
and all modern metrics, loss and activation functions and optimization algorithms -
from top Python and C++ neural net frameworks and libs, such as **Keras**, **Theano** and **TensorFlow**, 
and aims to be the first production-ready JS framework for Deep Learning. 


## Layers
Synaptic 2 supports most popular kinds of layers:

- **Activation** layers(softmax, softplus, softsign, relu, tanh, sigmoid, hard_sigmoid, linear, LeakyReLU, PReLU, ELU, ParametricSoftplus, ThresholdedReLU, SReLU)
- **Dense** layers, also known as **Fully-Connected**
- **Dropout**
- flow control layers: **Flatten**, **Reshape**, **Permute**, **RepeatVector**, **Merge**
- 1d, 2d and 3d **Convolution**, **ZeroPaddingConvolution**, **Max-, Min-, Avg-Pooling**
- Recurrent layers: **LSTM**, **GRU**, **SimpleRNN**
- **Embedding** layer
- various **Noize** layers


## Backends
It supports multiple computation backends, including 
- in-browser **GPGPU** - **WebCL** over **WebGL**
- efficient **native** layer
- **C++ bindings** to high-performance Linear Algebra libraries
- **CUDA**
- **TensorFlow** (and, probably asm.js-compiled TensorFlow,
because everything is better with asm.js)

## Shut up and show the code!

This is a simple example **Synaptic 2** training against
[MNIST](https://en.wikipedia.org/wiki/MNIST_database).

Just dense layers, no convolution or something of that kind:
```javascript
//yay! Synaptic 2 is tree-shaking-friendly package!
import {layers, objectives, optimizers, metrics, engines} from 'synaptic2';
import * as mnist from 'synaptic2/datasets/mnist';

// Synaptic 2 is heavily promise-based, as we're running code in separate process
async function main() {
 //We're creating classic and simple feed-forward, straight pipeline architecture here
 const network = new layers.FeedForward([
     // First, we need to declare what we're expecting to see as an input
     new layers.Input([28, 28]),
     // Then we're making 2d data a flat 1*N matrix 
     new layers.Flatten(),  
     new layers.Dense([1, 1000]),
     new layers.Activation.Relu(),
     new layers.Dropout(0.5),
     new layers.Dense([1, 10], {bias: false}),
     new layers.Activation.Softmax(),
 ])
 
 // Then we need to pre-compile the network. This is unusual stage for JS frameworks, but important one:
 // we're creating computation graph in this step and allocate all of our weights. 
 await network.compile({
     // optional parameter, AsmJS by default:
     // engine: engines.WebCL,
     loss: objectives.CategoricalCrossentropy,
     optimizer: optimizers.SGD({learningRate: 0.1}),
     metrics: [
         metrics.Accuracy
     ],
     verbose: 10
 });
 
 await network.train(mnist.x_train, mnist.y_train, {
     epochs: 1000
 })
 
 const {loss, metrics: [accuracy]} = await network.evaluate(mnist.x_test, mnist.y_test);
 
 console.log(accuracy) // => 0.997
 
 return (x) => network.predict(x);
}
```