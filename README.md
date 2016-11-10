This is a brief explanation of what I 'm' trying to do here:

The `engine` just holds the values and relationships between units, but it doesn’t do any math. It’s what the user uses to create the topology (add units, layers, connections, gates) and it’s what can be persisted and passed around, cloned, or whatever. It’s what holds the behaviour of the network once it’s trained, the minimum representation of it.

Then there's the `backend`, which right now creates an engine, maybe it would be better to receive one instead, but what’s important is that it’s the one in charge of doing the math. It computes `activation` and `propagation`, and also (this is not there yet) it should do the `train`.

There's the `network` that has an API like the one in synaptic 2.x draft. It receives a sequence of layers, and inits them one by one, passing itself (`this` ref) to each layer initializer.

Finally the `layers`, they all have an `init` method that is called and receives the `network`, then they can use the network to add units, layers, gates, etc.. I created a few examples of layers, like Dense, Convolution2D, and LSTM, I believe other layers like Dropout and MaxPool can be done using the gating capabilities of the units (ie Dropout it's a gater layer that randomly activates some gater units with 0, and the rest with 1, whi
