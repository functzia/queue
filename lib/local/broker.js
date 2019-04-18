const uuid = require('uuid');

module.exports = function startQueueBroker(broker) {
  const enqueue = (taskName, args) =>
    new Promise((resolve, reject) => {
      const taskId = uuid();
      broker.once(`${taskId}:success`, resolve);
      broker.once(`${taskId}:error`, reject);
      broker.emit(taskName, { taskId, args });
    });
  return new Proxy(
    {},
    {
      get(_t, taskType) {
        return payload => enqueue(taskType, payload);
      },
    },
  );
};
