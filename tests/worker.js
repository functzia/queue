const { startQueueWorker } = require('..').distributed;
const worker = startQueueWorker('ws://localhost:9090');
worker
  .register(function add({ x, y }) {
    return x + y;
  })
  .register(async function add2({ x }) {
    const y = await worker.get('y', 0);
    const value = x + y;
    await worker.set('y', value);
    if (value === x) {
      throw new Error();
    }
    return value;
  });
