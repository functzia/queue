const EventEmitter = require('events');
const WebSocket = require('ws');
const uuid = require('uuid');
const { errorToJSON } = require('json-error');

module.exports = function startQueueWorker(brokerURL) {
  const ws = new WebSocket(brokerURL);
  const cache = new EventEmitter();
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
    } else if (data.type === 'cache-response') {
      cache.emit(data.response.requestId, data.response.value);
    }
  });
  function cacheRequest(op, key, extra = {}) {
    const requestId = uuid();
    send({
      type: 'cache-request',
      value: {
        op,
        requestId,
        key,
        ...extra,
      },
    });
    return new Promise(resolve => cache.once(requestId, resolve));
  }
  const worker = {
    register(taskFn) {
      tasks[taskFn.name] = taskFn;
      return worker;
    },
    get(key, fallback) {
      return cacheRequest('get', key, { fallback });
    },
    set(key, value) {
      return cacheRequest('set', key, { value });
    },
    delete(key) {
      return cacheRequest('delete', key);
    },
  };
  return worker;
};
