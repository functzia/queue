const { startQueueBroker } = require('..').distributed;
const { add, add2 } = startQueueBroker(9090);
setTimeout(async () => {
  const value = await add({ x: 1, y: 3 });
  console.log(value);
}, 10000);
setTimeout(async () => {
  const value = await add2({ x: 3 }, 2);
  console.log(value);
}, 10000);
