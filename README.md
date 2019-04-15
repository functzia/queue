# queue

Pure node implementation of a distributed queue

## Usage

```js
// broker.js
const { startQueueBroker } = require('@fofx/queue');
const sendTask = startQueueBroker(9000);
sendTask('add', { x: 1, y: 2 }).then(value => console.log(value));
```

```js
// worker.js
const { startQueueWorker } = require('@fofx/queue');
const worker = startQueueWorker('ws://localhost:9000');
worker.register(function add({ x, y }) {
  return x + y;
});
```
