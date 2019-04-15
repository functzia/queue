const WebSocket = require('ws');
const { errorToJSON } = require('json-error');

module.exports = function startQueueWorker(brokerURL) {
  const ws = new WebSocket(brokerURL);
  const send = value => ws.send(JSON.stringify(value));
  const tasks = {};
  ws.on('message', async msg => {
    const data = JSON.parse(msg);
    if (data.type === 'bid') {
      const { bidId, taskType } = data;
      if (tasks[taskType]) {
        send({
          type: `bid:${bidId}`,
        });
      }
    } else if (data.type === 'task') {
      const { taskType, taskId, payload } = data;
      try {
        const value = await tasks[taskType](payload);
        send({ type: `task/success:${taskId}`, value });
      } catch (e) {
        send({ type: `task/failure:${taskId}`, value: errorToJSON(e) });
      }
    }
  });
  const worker = {
    register(taskFn) {
      tasks[taskFn.name] = taskFn;
      return worker;
    },
  };
  return worker;
};
