// This is my attepmt of translating this paper http://www.overcomplete.net/papers/nn2012.pdf to javascript,
// trying to keep the code as close as posible to the equations and as verbose as possible.

const defaults = {
  bias: true,
  generator: () => Math.random() * 2 - 1
}

export default class Engine {

  constructor ({ bias, generator } = defaults) {
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
    this.inputsOf = {}
    this.projectedBy = {}
    this.gatersOf = {}
    this.gatedBy = {}
    this.inputsOfGatedBy = {}
    this.projectionSet = {}
    this.gateSet = {}
    this.inputSet = {}
    this.derivativeTerm = {}
    this.connections = []
    this.gates = []
    this.learningRate = 0.1
    this.size = 0
    this.random = generator
    this.biasUnit = null

    // if using bias, create a bias unit, with a fixed activation of 1
    if (bias) {
      this.biasUnit = this.addUnit()
      this.activation[this.biasUnit] = 1
    }
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

    // this is only for input neurons (they receive their activation from the environment)
    if (typeof input !== 'undefined') {

      y[j] = input

    } else {

      // eq. 15
      s[j] = g[j][j] * w[j][j] * s[j] + Σ(this.inputSet[j], i => g[j][i] * w[j][i] * y[i]) // compute state of j

      // eq. 16
      y[j] = f[j](s[j]) // compute activation of j

      for (const i of this.inputSet[j]) { // comupute elegibility traces for j's inputs

        // eq. 17
        ε[j][i] = g[j][j] * w[j][j] * ε[j][i] + g[j][i] * y[i]

        for (const k of this.gatedBy[j]) { // compute extended elegibility traces for j's inputs

          // eq. 18
          xε[j][i][k] = g[k][k] * w[k][k] * xε[j][i][k] + df[j](s[j]) * ε[j][i] * this.bigParenthesisTerm(k, j)
        }
      }

      // update the gain of the connections gated by this unit with its activation value
      for (const to of this.gatedBy[unit]) {
        for (const from of this.inputsOfGatedBy[to][unit]) {
          // eq. 14
          g[to][from] = y[unit]
        }
      }
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

    // step 1: compute error responsibiltity (δ) for j

    if (typeof target !== 'undefined') { // this is only for output neurons, the error is injected from the environment

      // eq. 10
      δ[j] = δP[j] = target - y[j]

    } else { // for the rest of the units the error is computed by backpropagation

      // eq. 21
      δP[j] = df[j](s[j]) * Σ(P[j], k => δ[k] * g[k][j] * w[k][j])

      // eq. 22
      δG[j] = df[j](s[j]) * Σ(G[j], k => δ[k] * this.bigParenthesisTerm(k, j))

      // eq. 23
      δ[j] = δP[j] + δG[j]

    }

    // step 2: adjust the weights (Δw) for all the inputs of j

    for (const i of this.inputSet[j]) {
      // eq. 24
      w[j][i] += α * δP[j] * ε[j][i] + α * Σ(G[j], k => δ[k] * xε[j][i][k])
    }
  }

  // this calculate the big parenthesis term that is present in eq. 18 and eq. 22
  bigParenthesisTerm (k, j) {
    // glosary
    const w = this.weight
    const s = this.state
    const y = this.activation
    const dt = this.derivativeTerm[k][j] // the derivative term is 1 if and only if j gates k's self-connection, otherwise is 0
    const gatedInputs = this.inputsOfGatedBy[k][j] // this index runs over all the inputs of k, that are gated by j

    // big parenthesis term
    return dt * w[k][k] * s[k] + Σ(gatedInputs, a => w[k][a] * y[a])
  }

  addUnit () {
    const unit = this.size
    this.state[unit] = this.random()
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
    this.inputsOf[unit] = []
    this.projectedBy[unit] = []
    this.gatersOf[unit] = []
    this.gatedBy[unit] = []
    this.inputsOfGatedBy[unit] = {}
    this.derivativeTerm[unit] = {}
    this.inputSet[unit] = []
    this.projectionSet[unit] = []
    this.gateSet[unit] = []
    this.size++

    // if using bias, connect bias unit to newly created unit
    if (this.biasUnit != null) {
      this.addConnection(this.biasUnit, unit)
    }

    return unit
  }

  addConnection (from, to, weight = null) {
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
    this.weight[j][i] = isSelfConnection ? 1 : weight == null ? this.random() : weight // self-connections have a fixed weight of 1 (this is explained in the text between eq. 14 and eq. 15)
    this.elegibilityTrace[j][i] = 0
    this.extendedElegibilityTrace[j][i] = {}

    // track units
    this.track(to)
    this.track(from)
  }

  addGate (from, to, gater) {
    // if the connection is already gated or is a bias connection then return
    const alreadyGated = this.gates.some(gate => gate.from === from && gate.to === to)
    const isBias = from === this.biasUnit
    if (alreadyGated || isBias) {
      return
    }

    this.gates.push({ from, to, gater })

    // track units
    this.track(to)
    this.track(from)
    this.track(gater)
  }

  track (unit) {

    // each unit keeps track of all the units that project a connection into it (aka inputs)
    this.inputsOf[unit] = uniq(this.connections
      .filter(connection => connection.to === unit)
      .map(connection => connection.from))

    // each unit keeps track of all the units that receive a connection from them (aka projections)
    this.projectedBy[unit] = uniq(this.connections
      .filter(connection => connection.from === unit)
      .map(connection => connection.to))

    // each unit keeps track of all the other units gating connections into it
    this.gatersOf[unit] = uniq(this.gates
      .filter(gate => gate.to === unit)
      .map(gate => gate.gater))

    // each unit keeps track of all the units that receive connections gated by them
    this.gatedBy[unit] = uniq(this.gates
      .filter(gate => gate.gater === unit)
      .map(gate => gate.to))

    /* According to eq. 18:
      If unit j gates connections into other units k, it must maintain a set of
      extended eligibility traces for each such k. A trace of this type captures
      the efect that the connection from i potentially has on the state of k
      through its influence on j
    */

    // track extended elegibility traces for j
    this.inputsOf[unit].forEach(i => {
      this.gatedBy[unit].forEach(k => {
        this.extendedElegibilityTrace[unit][i][k] = 0
      })
    })
    // track extended elegibility traces for i
    this.projectedBy[unit].forEach(j => {
      this.gatedBy[j].forEach(k => {
        this.extendedElegibilityTrace[j][unit][k] = 0
      })
    })
    // track extended elegibility traces for k
    this.gatersOf[unit].forEach(j => {
      this.inputsOf[j].forEach(i => {
        this.extendedElegibilityTrace[j][i][unit] = 0
      })
    })

    /*
      also, in order to compute the Big Parenthesis Term (eq. 18 and eq. 22)
      each unit must track an index that runs over all the units whose
      connections to k are gated by j (and are not a self-connection)
    */

    // track inputs of unit gated by j
    this.inputsOf[unit].forEach(i => {
      this.gatersOf[unit].forEach(j => {
        this.inputsOfGatedBy[unit][j] = uniq(
          this.inputsOfGatedBy[unit][j],
          this.gates
            .filter(gate => gate.gater === j && gate.to === unit && gate.from === i && gate.to !== gate.from)
            .map(gate => gate.from)
        )
      })
    })
    // track inputs of k gated by unit
    this.gatedBy[unit].forEach(k => {
      this.inputsOf[k].forEach(i => {
        this.inputsOfGatedBy[k][unit] = uniq(
          this.inputsOfGatedBy[k][unit],
          this.gates
            .filter(gate => gate.gater === unit && gate.to === k && gate.from === i && gate.to !== gate.from)
            .map(gate => gate.from)
        )
      })
    })

    /*
      also, in order to compute the Big Parenthesis Term
      each unit must track of a derivative term that can
      be 1 if and only if j gates k's self-connection,
      otherwise it is 0
    */

    // compute derivative term for k gated by unit
    this.gatedBy[unit].forEach(k => {
      this.derivativeTerm[k][unit] = this.gates
        .some(gate => gate.to === k && gate.from === k && gate.gater === unit)
        ? 1
        : 0
    })
    // compute derivative term for unit gated by j
    this.gatersOf[unit].forEach(j => {
      this.derivativeTerm[unit][j] = this.gates
        .some(gate => gate.to === unit && gate.from === unit && gate.gater === j)
        ? 1
        : 0
    })

    // each unit keeps track of all the other units that project a connection into them, and that are not self-connections (see eq. 4)
    this.inputSet[unit] = this.inputsOf[unit].filter(input => input !== unit)

    // each unit keeps track of all the other units that they project connections into, and that are downstream of them (see eq. 19)
    this.projectionSet[unit] = this.projectedBy[unit].filter(projected => projected > unit)

    // each unit keeps track of all the units that they are gating a connection into, and that are downstream of them (see eq. 20)
    this.gateSet[unit] = this.gatedBy[unit].filter(gated => gated > unit)
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

// helper for removing duplicated ints from an array
function uniq (...arrays) {
  const concated = arrays.reduce((concated, array) => concated.concat(array || []), [])
  var o = {}, a = [], i
  for (i = 0; i < concated.length; o[concated[i++]] = 1);
  for (i in o) a.push(+i)
  return a;
}
