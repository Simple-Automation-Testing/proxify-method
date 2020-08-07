const noop = {
  get: () => Promise.resolve({status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}}),
  post: () => Promise.resolve({status: 200, body: [1, 23, 4], headers: {'Content-Type': 'application/json'}}),
}

class MainIterface {

  constructor() {

  }
}