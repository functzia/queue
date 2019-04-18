module.exports = function startQueueWorker(broker) {
  const cache = {};
  return {
    register(taskFn) {
      broker.on(taskFn.name, async ({ taskId, args }) => {
        try {
          const value = await taskFn(...args);
          return broker.emit(`${taskId}:success`, value);
        } catch (error) {
          return broker.emit(`${taskId}:failure`, error);
        }
      });
    },
    get(key, fallback = null) {
      if (!(key in cache)) {
        cache[key] = fallback;
      }
      return cache[key];
    },
    set(key, value) {
      cache[key] = value;
    },
    delete(key) {
      delete cache[key];
    },
  };
};
