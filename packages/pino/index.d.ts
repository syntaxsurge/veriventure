export type LoggerLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

export interface LoggerOptions {
  level?: LoggerLevel;
}

export interface PinoLogger {
  level: LoggerLevel;
  levels: {
    values: Record<Exclude<LoggerLevel, "silent">, number>;
    labels: Record<number, Exclude<LoggerLevel, "silent">>;
  };
  child: () => PinoLogger;
  fatal: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
}

declare function pino(options?: LoggerOptions): PinoLogger;

declare namespace pino {
  const levels: PinoLogger["levels"];
}

export = pino;
