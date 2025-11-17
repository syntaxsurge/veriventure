const LEVEL_VALUES = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

const LEVEL_LABELS = {
  60: "fatal",
  50: "error",
  40: "warn",
  30: "info",
  20: "debug",
  10: "trace",
};

function createLogger(opts = {}) {
  const logger = {
    level: opts.level || "error",
    levels: { values: LEVEL_VALUES, labels: LEVEL_LABELS },
    bindings: () => ({ context: "" }),
    child: () => createLogger(opts),
    fatal: console.error.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    info: console.log.bind(console),
    debug: console.debug.bind(console),
    trace: console.debug.bind(console),
    flush: () => {},
  };
  return logger;
}

function pino(opts = {}) {
  const logger = createLogger(opts);
  logger.destination = () => logger;
  return logger;
}

pino.levels = { values: LEVEL_VALUES, labels: LEVEL_LABELS };

module.exports = pino;
module.exports.default = pino;
module.exports.pino = pino;
module.exports.levels = pino.levels;
