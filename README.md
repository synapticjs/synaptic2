This is a brief explanation of what I 'm' trying to do here:

The `Engine` just holds the values (states, weights, traces, etc) and relationships (connections, gates) between units, but it doesn’t do any math. It’s what the user uses to create the topology (add units, layers, connections, gates) and it’s what can be persisted and passed around, cloned, or whatever. It’s what holds the behaviour of the network once it’s trained, the minimum representation of it.

Then there are the `backends`, a backend is the one in charge of doing the math. It computes `activation` and `propagation`, and also it does the training thru a `train` function.

There's the `Network` that has an API like the one in synaptic 2.x draft. It receives a sequence of layers, and inits them one by one, passing itself (`this` ref) to each layer initializer, along with a `boundary`.

Finally the `layers`, they can have an `init` method that is called and receives the `network`, and a `boundary`. They can use the `network` instance to add units, connections, gates, layers (yes, a layer can add several layers to the engine, like the case of LSTM that adds memory cell, input gate, forget gate and output gate) and what not, and finally they can return a `boundary`, which consist of a layer and their dimensions (width, height, depth). This `boundary` will be received by the next inited `layer`. Layers can also implement a `reverseInit` method, this is called for all the layers, in reverse order, passing this time the `boundary` of the _next_ layer. This is specially useful for gating outbound connections. Units, connections and gates can be added during the reverse init phase, **but no new layers can be added** to the engine (that would screw up what previous layers have done during the regular init phase). Layer don't have to always return a boundary, ie. if layer A returns a boundary, it will be received by layer B. if layer B doesn't return a boundary, layer C will receive layers A boundary, and so forth until a layer returns a boundary. An example of a layer that doesn't return a boundary is Dropout.

There's also a `Trainer` that basically uses the backend's `train` to do the training, it should also do cross validation and let the user perform a test over a given dataset.

I created a few examples of layers, like Dense, Convolution, and LSTM, MaxPool, Dropout and some more all using the same algorithm (LSTM-g) the only thing that changes is the way units are connected/gated. I believe the algorithm is flexible enough to implement the most common layers.

There’s a `usage.js` file showing how it should work (**all this still doesn't work, it's just to get the idea**)
