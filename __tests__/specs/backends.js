const synaptic = process.env.NODE_ENV == 'node' ? require('../../dist') : require('../../dist/synaptic')
const testBackend = require('../../utils/backendSharedTests')

describe('Backends', () => {
  //testBackend('Paper', synaptic.backends.Paper)
  testBackend('CPU', synaptic.backends.CPU)
})
