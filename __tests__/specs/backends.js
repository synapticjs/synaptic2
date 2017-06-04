const synaptic = process.env.NODE_ENV == 'node' ? require('../../dist') : require('../../dist/synaptic')
const testBackend = require('../../utils/backendSharedTests')

describe('Backends', () => {
  testBackend('ASM', synaptic.backends.ASM)
  //testBackend('CPU', synaptic.backends.CPU)
  //testBackend('ASM', synaptic.backends.ASM, { logLevel: 2 })
})
