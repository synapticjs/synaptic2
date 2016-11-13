This is a brief explanation of what I 'm' trying to do here:

The `engine` just holds the values and relationships between units, but it doesn’t do any math. It’s what the user uses to create the topology (add units, layers, connections, gates) and it’s what can be persisted and passed around, cloned, or whatever. It’s what holds the behaviour of the network once it’s trained, the minimum representation of it.

Then there's the `backend`, it’s the one in charge of doing the math. It computes `activation` and `propagation`, and also (this is not there yet) it should do the `train`.

There's the `network` that has an API like the one in synaptic 2.x draft. It receives a sequence of layers, and inits them one by one, passing itself (`this` ref) to each layer initializer, along with a `boundary`.

Finally the `layers`, they all have an `init` method that is called and receives the `network`, and a `boundary`. They can use the `network` instance to add units, connections, gates, layers and what not, and finally they can return a `boundary`, which consist of a layer and their dimensions (width, height, depth). This `boundary` will be received by the next inited `layer`. Layers can also implement a `reverseInit` method, this is called for all the layers, in reverse order, passing this time the `boundary` of the _next_ layers. This is specially useful for gating. Units, connections and gates can be added during the reverse init phase, but no new layers can be added to the engine (that would screw up what previous layers have done during the regular init phase). Layer don't have to always return a boundary, ie. if layer A returns a boundary, it will be received by layer B. if layer B doesn't return a boundary, layer C will receive layers A boundary, and so forth until a layer returns a boundary.

I created a few examples of layers, like Dense, Convolution2D, and LSTM, MaxPool2D, and stuff. I believe other layers like Dropout and MaxPool can be done using the gating capabilities of the units (ie Dropout it's a gater layer that randomly activates some gater units with 0, and the rest with 1, while training. Or MaxPool is la layer gater layer that activates 1 for the units in the pool with the max activation, and 0 for the other), so we can still use the same algorithm we are using now, and the same backends, it’s just the way we connect the neurons what makes the difference between layers.

There will also be a `trainer` that basically uses the backend's `train` to do the training.

There’s a `usage.js` file showing how it would work.

So the API i’m aiming for looks something like this for the engine, backend and network

```
// — engine

ActivationTypes = {
  SIGMOID: 'Sigmoid',
  ReLU: 'ReLU',
  MAX_POOLING: 'Max Pooling
  DROPOUT: 'Dropout'
}

constructor ({ bias: bool = true, generator:  ( ) => number = Math.random() * 2 - 1 })

state []
weight [] []
gain [] []
activation []
elegibilityTrace [] []
extendedElegibilityTrace [] [] []
errorResponsibility []
projectedErrorResponsibility []
gatedErrorResponsibility []
activationFunction []
projectSet []
gateSet []
inputsOf []
gatersOf []
gatedBy []
inputsOfGatedBy [] []
learningRate: number
bias: bool
training: bool
layers [] []

addUnit ([activationType])
addConnection(from, to[, weight])
addGate(from, to, gater)
addLayer(size, [activationType ])
clone()
toJSON()
fromJSON(json)
clear()

// —backend

activate(input, layer)
propagate(input, layer)
train(dataset)

// — network

constructor(sequenceOfLayers)
activate(input)
propagate(input)
(bindings to the engine methods like addUnit, addConnection, addGate, addLayer, clone, toJSON, clear)
```
=======
This is a brief explanation of what I 'm' trying to do here:

The `engine` just holds the values and relationships between units, but it doesn’t do any math. It’s what the user uses to create the topology (add units, layers, connections, gates) and it’s what can be persisted and passed around, cloned, or whatever. It’s what holds the behaviour of the network once it’s trained, the minimum representation of it.

Then there's the `backend`, which right now creates an engine, maybe it would be better to receive one instead, but what’s important is that it’s the one in charge of doing the math. It computes `activation` and `propagation`, and also (this is not there yet) it should do the `train`.

There's the `network` that has an API like the one in synaptic 2.x draft. It receives a sequence of layers, and inits them one by one, passing itself (`this` ref) to each layer initializer.

Finally the `layers`, they all have an `init` method that is called and receives the `network`, then they can use the network to add units, layers, gates, etc.. I created a few examples of layers, like Dense, Convolution2D, and LSTM, I believe other layers like Dropout and MaxPool can be done using the gating capabilities of the units (ie Dropout it's a gater layer that randomly activates some gater units with 0, and the rest with 1, while training. Or MaxPool is la layer gater layer that activates 1 for the units in the pool with the max activation, and 0 for the other), so we can still use the same algorithm we are using now, and the same backends, it’s just the way we connect the neurons what makes the difference between layers.

There will also be a `trainer` that basically uses the backend's `train` to do the training.

There’s a `usage.js` file showing how it would work, some parts wont work (like the ConvNet) cos there are some layers missing (MaxPool, Activation).

So the API i’m aiming for looks something like this for the engine, backend and network

```
// — engine

ActivationTypes = {
  SIGMOID: 'Sigmoid',
  ReLU: 'ReLU',
  MAX_POOLING: 'Max Pooling
  DROPOUT: 'Dropout'
}

constructor ({ bias: bool = true, generator:  ( ) => number = Math.random() * 2 - 1 })

state []
weight [] []
gain [] []
activation []
elegibilityTrace [] []
extendedElegibilityTrace [] [] []
errorResponsibility []
projectedErrorResponsibility []
gatedErrorResponsibility []
activationFunction []
projectSet []
gateSet []
inputsOf []
gatersOf []
gatedBy []
inputsOfGatedBy [] []
learningRate: number
bias: bool
training: bool
layers [] []

addUnit ([activationType])
addConnection(from, to[, weight])
addGate(from, to, gater)
addLayer(size, [activationType ])
clone()
toJSON()
fromJSON(json)
clear()

// —backend

activate(input, layer)
propagate(input, layer)
train(dataset)

// — network

constructor(sequenceOfLayers)
activate(input)
propagate(input)
(bindings to the engine methods like addUnit, addConnection, addGate, addLayer, clone, toJSON, clear)
```
