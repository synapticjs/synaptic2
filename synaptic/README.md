# Synaptic operations

Synaptic operations is a low-level package which purpose is 
to provide universal math and common computations back-end 
via multiple transports.

Generated back-end is an cross-product of 3 parameters:
- transport
- computation engine
- float operation precision

### Available transports are:

- child_process (node.js)
- **TBD:** webWorker (browser)
- **WIP:** plain (anywhere)

### Available computation engines are:

- **WIP:** numpy (recommended only for debugging purpose)
- **TBD:** asm.js (compatible with all backends)
- **TBD:** asm.js with auto-detected CPU optimisations (only **node.js**)
- **TBD:** GPGPU over WebGL (only **plain** transport)
- **TBD:** OpenCL (only **node.js**)
- **TBD:** Cuda (only **node.js** and only if compatible Nvidia GPU is available)

### Available precisions are:

*this list can be changed in a future*

- float32
- TBD: float64

### API:

#### `Pointer` class

**Operations** library is intended to provide very specific, 
mostly internal functionality, so only one type of data is presented: Tensor. 
[Tensor](https://en.wikipedia.org/wiki/Tensor) is a complicated mathematics abstraction, 
but for simplicity it can be understood as N-dimensional array, where N is positive integer.

- 0-dimension tensor is a scalar, e.g. `2`, which is described as `{}`
- 1-dimension tensor is a vector, e.g. `[2,3,4]`, which is described as `{3}`
- 2-dimension tensor is a matrix, e.g. `[[1,2], [3,4]]`, which is described as `{2,2}`

Important thing is that there is no possibility of something like `[[1], [2,3]]`,
when sub-arrays shape differ from each other.

Important thing is that pointers are lazy, and data is transferred only when compiler starts working.
This is related to the fact that **operations** record the script for the first time, 
and only after that they are using the back-end to actual execution. 
Only at that moment of time package knows what backend is used, and it is pulling variables in it.

```typescript
declare class Pointer {
    static random(shape: number[], deviation?: number = 0.5, mean?: number = 0.5);
    static zeros(shape: number[]);
    static ones(shape: number[]);
    
    constructor(shape: number[]);
    
    /*TBD: support of ReadableStream and Blob*/
    write(value: TypedArray | ndarray): void;
    
    read(): Promise<ndarray>;
}

```

#### `Recorder` class

Recorder class is a tricky one. You are acting like you are calling the functions, 
but instead you are just putting them in computational graph that will be executed later.
Also it is performing some basic asserts (sometimes).

Example:

```
const one = Pointer.ones([]);
const zero = Pointer.zeros([]);
const matrix = Pointer.random([2,2]);
const result = new Pointer([2,2]);

const r = new Recorder();
r.blas.sgemm(result, zero, matrix, matrix, zero, matrix);
const record = r.save();
//here, result var is not changed yet
```

API:
```typescript
/* also known as record*/
declare class ComputationalGraph { 
    // well, it is doing basically nothing except keeps data structure and used pointers
}

declare class Recorder {
    constructor();
    
    save(): ComputationalGraph;
    // you can think about it as a pointer. 
    // (however, it's an instance of internal class LambdaPointer, not public class Pointer).
    // Yay! functional meta-programming in JS!
    lambda(fn: Function): Pointer; 
    
    ternary(condition: Function, trulyFunction: Function, falsyFunction: Function): void;
    
    log(anything: Pointer): void;
    //see BLAS spec for list of methods. Note: not all of them are implemented, depends on back-end.
    blas: {} 
}
```

#### `Executor` class

`Executor` is, basically, executing the recorded `ComputationalGraph`.
 
API:
```typescript

declare class Executor {
    // for now, you should monitor on your own what is happening to your app 
    // and not to try to access CUDA in web worker. to be fixed in a future.
    
    constructor({backend: Backend, transport: Transport});
    
    run(graph: ComputationalGraph, loggingCallback?: (value: ndarray)=>any): Promise<void>;
    
    //generally, it's an internal method, though can be used for some memory-related external purposes
    _allocate(): Promise;
}
```