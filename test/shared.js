
function buildPerceptron (engine) {

}

function buildLSTM (engine) {

}

function testEngine (Engine) {

  test('engine exists', () => {
    expect(new Engine()).toBeDefined()
  })
}


module.exports = {
  testEngine: testEngine
}
