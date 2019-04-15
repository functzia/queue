const startBroker = require('../broker');
const sendTask = startBroker(8080);
setTimeout(async () => {
  const value = await sendTask('add', { x: 1, y: 3 });
  console.log(value);
}, 10000);
setTimeout(async () => {
  const value = await sendTask('add2', { x: 3 }, 2);
  console.log(value);
}, 10000);