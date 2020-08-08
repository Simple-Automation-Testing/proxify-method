
# proxify-method (beta)

### Zero dependencies package.
### Main purpose of this package is to provide integration of the common assertions into class methods
### without refactoring and updates of the class methods, this package does not affect constructor, getters/setters
### and does not affect internal logic of the class methods. Package works with async function/Promises,
### for common sync code this package will not provide any useful effect.


#### Usage

```js
// example with node-fetch and chai
const fetch = require('node-fetch');
const {chainProxify} = require('proxify-method');
const {expect} = require('chai');

function assertResponseBody(expectedBodyTextPart, {response}) {
  expect(response).to.include(expectedBodyTextPart)
}

function assertResponseBodyStrictEqual(expectedBody, {response}) {
  expect(response).to.equal(bodyTextPart)
}

class ControllerIterface {
  constructor() {
    // this two assertions will be available for every method in this class
    chainProxify('assertBodyIncludes', assertResponseBody)
      .chainProxify('strictAssertBody', assertResponseBodyStrictEqual)
      .initChainModel(this);
  }

  getDataFromServerController() {
    return fetch('http://someurl.that.returns.some.data')
    .then(result => result.text())
    // this {response: result} object will be second argument of the assert functions
    .then(result => ({response: result}))
  }

  postDataFromServerController() {
    return fetch('http://someurl.that.should_receive.some.data', {method: 'POST', body: 'string data'})
    .then(result => result.text())
    // this {response: result} object will be second argument of the assert functions
    .then(result => ({response: result}))
  }
}


async function test() {
  const controller = new ControllerIterface();

  const expectedGetBodyPart = 'some string';
  const expectedGetBodyFull = 'some string full'
  // can be done like TDD
  const {response: responseTddExample} = await controller.getDataFromServerController();
  expect(responseTddExample).to.include(expectedGetBodyPart);
  expect(responseTddExample).to.equal(expectedGetBodyFull);
  // ... usage of the response
  const resultTdd = responseTddExample;

  // can be done like BDD
  const {response: responseBddExample} = await controller.getDataFromServerController()
    .assertBodyIncludes(expectedGetBodyPart)
    .strictAssertBody(expectedGetBodyFull)
  // ... usage of the response
  const resultBdd = responseBddExample;
}
```
