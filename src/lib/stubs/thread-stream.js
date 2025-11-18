class ThreadStream {
  constructor() {
    if (process.env.NODE_ENV !== "production") {
      console.warn("thread-stream is not supported in this environment; logging transport disabled.");
    }
  }

  on() {
    return this;
  }

  once() {
    return this;
  }

  emit() {
    return this;
  }

  end() {
    return this;
  }

  flushSync() {}

  unref() {}

  ref() {}

  destroy() {
    return this;
  }
}

module.exports = ThreadStream;
module.exports.default = ThreadStream;
