// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

export default class Engine {

  constructor () {
    this.state = {}
    this.weight = {}
    this.gain = {}
    this.activation = {}
    this.elegibilityTrace = {}
    this.extendedElegibilityTrace = {}
    this.errorResponsibility = {}
    this.projectedErrorResponsibility = {}
    this.gatedErrorResponsibility = {}
    this.activationFunction = {}
    this.activationFunctionDerivative = {}
    this.inputSet = {}
    this.projectionSet = {}
    this.gateSet = {}
    this.connections = []
    this.gates = []
    this.learningRate = 0.1
    this.size = 0
  }

  activate (unit, input) {
    // glosary
    const j = unit
    const s = this.state
    const w = this.weight
    const g = this.gain
    const y = this.activation
    const f = this.activationFunction
    const df = this.activationFunctionDerivative
    const ε = this.elegibilityTrace
    const xε = this.extendedElegibilityTrace
    const inputs = this.inputSet

    // this is only for input neurons (they receive their activation from the environment)
    if (typeof input !== 'undefined') {

      y[j] = input

    } else {

      // eq. 15
      s[j] = g[j][j] * w[j][j] * s[j] + Σ(inputs[j], i => g[j][i] * w[j][i] * y[i]) // compute state of j

      // eq. 16
      y[j] = f[j](s[j]) // compute activation of j

      for (var i in ε[j]) { // comupute elegibility traces for j's inputs

        // eq. 17
        ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i]

        for (var k in xε[j][i]) { // compute extended elegibility traces for j's inputs

          // eq. 18
          xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df[j](s[j]) * ε[j][i] * this.bigParenthesisTerm(j, +k)
        }
      }

      // update the gain of the connections gated by this unit with its activation value
      this.gates
        .filter(gate => gate.gater === unit)
        .forEach(gate => {
          // eq. 14
          g[gate.to][gate.from] = y[unit]
        })
    }

    // return the activation of this unit
    return y[j]
  }

  propagate (unit, target) {
    // glosary
    const j = unit
    const s = this.state
    const w = this.weight
    const g = this.gain
    const y = this.activation
    const df = this.activationFunctionDerivative
    const δ = this.errorResponsibility
    const δP = this.projectedErrorResponsibility
    const δG = this.gatedErrorResponsibility
    const α = this.learningRate
    const ε = this.elegibilityTrace
    const xε = this.extendedElegibilityTrace
    const P = this.projectionSet
    const G = this.gateSet
    const inputs = this.inputSet

    // step 1: compute error responsibiltity (δ) for j

    if (typeof target !== 'undefined') { // this is only for output neurons, the error is injected from the environment

      // eq. 10
      δ[j] = δP[j] = target - y[j]

    } else { // for the rest of the units the error is computed by backpropagation

      // eq. 21
      δP[j] = df[j](s[j]) * Σ(P[j], k => δ[k] * g[k][j] * w[k][j])

      // eq. 22
      δG[j] = df[j](s[j]) * Σ(G[j], k => δ[k] * this.bigParenthesisTerm(j, k))

      // eq. 23
      δ[j] = δP[j] + δG[j]

    }

    // step 2: adjust the weights (Δw) for all the inputs of j

    inputs[j].forEach(i => {
      // eq. 24
      w[j][i] += α * δP[j] * ε[j][i] + α * Σ(G[j], k => δ[k] * xε[j][i][k])
    })
  }

  // this calculate the big parenthesis term that is present in eq. 18 and eq. 22
  bigParenthesisTerm (j, k) {
    // glosary
    const w = this.weight
    const s = this.state
    const y = this.activation

    // this index runs over all the units whose connections to k are gated by j (and are not a self-connection)
    var inputsOfK_gatedByJ = this.gates
      .filter(gate => gate.to === k && gate.gater === j) // only connections to k that are gated by j
      .filter(gate => gate.from !== gate.to) // filter out self-connections
      .map(gate => gate.from) // grab unit projecting the connection

    // this is the derivative term described in eq. 18 that can be 1 if and only if j gates k's self-connection, otherwise it is 0
    var derivativeTerm = this.gates.some(gate => gate.from === k && gate.to === k && gate.gater === j)
      ? 1
      : 0

    // big parenthesis term
    return derivativeTerm * w[k][k] * s[k] + Σ(inputsOfK_gatedByJ, a => w[k][a] * y[a])
  }

  addUnit () {
    const unit = this.size
    this.state[unit] = random()
    this.weight[unit] = {}
    this.gain[unit] = {}
    this.elegibilityTrace[unit] = {}
    this.extendedElegibilityTrace[unit] = {}
    this.activation[unit] = 0
    this.weight[unit][unit] = 0 // since it's not self-connected the weight of the self-connection is 0 (this is explained in the text between eq. 14 and eq. 15)
    this.gain[unit][unit] = 1 // ungated connections have a gain of 1 (eq. 14)
    this.elegibilityTrace[unit][unit] = 0
    this.extendedElegibilityTrace[unit][unit] = {}
    this.activationFunction[unit] = LOGISTIC_SIGMOID
    this.activationFunctionDerivative[unit] = LOGISTIC_SIGMOID_DERIVATIVE
    this.errorResponsibility[unit] = 0
    this.projectedErrorResponsibility[unit] = 0
    this.gatedErrorResponsibility[unit] = 0
    this.inputSet[unit] = []
    this.projectionSet[unit] = []
    this.gateSet[unit] = []
    this.size++
    return unit
  }

  addConnection (from, to) {
    // if the connection already exists then return
    if (this.connections.some(connection => connection.from === from && connection.to === to)) {
      return
    }
    // add the connection to the list
    this.connections.push({ from, to })

    // setup connection
    const j = to
    const i = from
    const isSelfConnection = (from === to)
    this.gain[j][i] = 1 // ungated connections have a gain of 1 (eq. 14)
    this.weight[j][i] = isSelfConnection ? 1 : random() // self-connections have a fixed weight of 1 (this is explained in the text between eq. 14 and eq. 15)
    this.elegibilityTrace[j][i] = 0
    this.extendedElegibilityTrace[j][i] = {}

    // each unit keeps track of all the units that project a connection into it (aka inputs), and that are not a self-connection (see the text below eq. 14)
    this.connections
      .filter(connection => connection.to === to) // get all the connections that go into the unit
      .filter(connection => connection.from !== connection.to) // filter out self-connections
      .map(connection => connection.from) // grab the unit projecting the connection
      .forEach(unit => {
        // add the results to the list of inputs of the unit (only if they are not there already)
        if (!this.inputSet[to].includes(unit)) {
          this.inputSet[to].push(unit)
        }
      })

    // also, each unit keeps track of all the other units that they project connections to, and that are downstream of them (see eq. 19)
    this.connections
      .filter(connection => connection.from === from) // get all the connections comming from the unit
      .map(connection => connection.to) // grab the unit receiving the connection
      .filter(unit => unit > from) // keep only the downstream units (they get activated after this unit)
      .forEach(unit => {
        // add the results to the list of projections of the unit (only if they are not there already)
        if (!this.projectionSet[from].includes(unit)) {
          this.projectionSet[from].push(unit)
        }
      })

    /* According to eq. 18:
      If unit j gates connections into other units k, it must maintain a set of
      extended eligibility traces for each such k (Eq. 18). A trace of this type
      captures the efect that the connection from i potentially has on the state of k
      through its influence on j
    */

    // get the k's (units that receive connections gated by j)
    this.gates
      .filter(gate => gate.gater === j)
      .map(gate => gate.to)
      .forEach(k => {
        // for each such k, mantain a set of extended elegibility traces for each connection from i
        this.inputSet[j].forEach(i => {
          this.extendedElegibilityTrace[j][i][k] = 0
        })
      })
  }

  addGate (from, to, gater) {
    // if the connection is already gated then return
    if (this.gates.some(gate => gate.from === from && gate.to === to)) {
      return
    }
    this.gates.push({ from, to, gater })

    // setup gate
    const j = gater
    const k = to
    for (var i in this.elegibilityTrace[j]) {
      // add an extended elegibility trace for the unit that receives the gated connection (see eq. 18)
      this.extendedElegibilityTrace[j][i][k] = 0
    }

    // each unit keeps track of all the units that they are gating a connection into, and that are downstream of them (see eq. 20)
    this.gates
      .filter(gate => gate.gater === gater) // get all the connections gated by the unit
      .map(gate => gate.to) // grab the unit receiving the connection
      .filter(unit => unit > gater) // keep only the downstream units (they get activated after this unit)
      .forEach(unit => {
        // add the results to the list of units gated by the gater unit (only if they are not there already)
        if (!this.gateSet[gater].includes(unit)) {
          this.gateSet[gater].push(unit)
        }
      })
  }
}

export function LOGISTIC_SIGMOID (x) {
  return 1 / (1 + Math.exp(-x))
}

export function LOGISTIC_SIGMOID_DERIVATIVE (x) {
  var fx = LOGISTIC_SIGMOID(x)
  return fx * (1 - fx)
}

// helper for doing summations
function Σ (indexes, fn) {
  return indexes.reduce((sum, index) => sum + fn(index), 0)
}

// helper for generating random numbers
function random () {
  return Math.random() * 2 - 1
}
