# queue

Pure node implementation of a distributed queue

## Usage

```js
// broker.js
const { startQueueBroker } = require('@fofx/queue').distributed;
const { add } = startQueueBroker(9000);
add({ x: 1, y: 2 }).then(value => console.log(value));
```

```js
// worker.js
const { startQueueWorker } = require('@fofx/queue').distributed;
const worker = startQueueWorker('ws://localhost:9000');
worker.register(async function add({ x, y }) {
  const constant = await worker.get('const', 0);
  const value = x + y + constant;
  await worker.set('const', value);
  return x + y;
});
```
