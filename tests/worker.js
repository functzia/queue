const startWorker = require('../worker');
const worker = startWorker('ws://localhost:8080');
let fail = true;
worker
  .register(function add({ x, y }) {
    return x + y;
  })
  .register(function add2({ x, y }) {
    if (fail) {
      fail = !fail;
      throw new Error();
    }
    return x + y;
  });
