const uuid = require('uuid');
const { errorFromJSON } = require('json-error');
const { Server: WebSocketServer } = require('ws');

const send = (ws, value) => ws.send(JSON.stringify(value));

module.exports = function startQueueBroker(port) {
  const wss = new WebSocketServer({ port });
  const clients = new Set();
  const broadcast = value => clients.forEach(ws => send(ws, value));
  wss.on('connection', ws => {
    clients.add(ws);
    ws.once('close', () => clients.delete(ws));
    ws.on('message', msg => {
      const data = JSON.parse(msg);
      const { type, value } = data;
      ws.emit(type, value);
    });
  });
  function bidTask(taskType) {
    const bidId = uuid();
    broadcast({
      type: 'bid',
      taskType,
      bidId,
    });
    return new Promise(resolve => {
      clients.forEach(ws => ws.once(`bid:${bidId}`, () => resolve(ws)));
    });
  }
  function sendTask(worker, taskType, payload) {
    const taskId = uuid();
    send(worker, {
      type: 'task',
      taskType,
      payload,
      taskId,
    });
    return new Promise((resolve, reject) => {
      worker.once(`task/success:${taskId}`, value => resolve(value));
      worker.once(`task/failure:${taskId}`, value => reject(value));
    });
  }
  return async function(taskType, payload, attempts = 1) {
    let error;
    for (let i = 0; i < attempts; i++) {
      const worker = await bidTask(taskType);
      try {
        const value = await sendTask(worker, taskType, payload);
        return value;
      } catch (e) {
        error = e;
      }
    }
    if (error) {
      throw errorFromJSON(error);
    }
  };
};
