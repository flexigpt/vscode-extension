/* eslint-disable @typescript-eslint/no-empty-function */
export interface ILogger {
    log(...args: unknown[]): void;
    error(...args: unknown[]): void;
    info(...args: unknown[]): void;
}

export const noopLogger: ILogger = {
    log: (..._args: unknown[]) => {},
    error: (..._args: unknown[]) => {},
    info: (..._args: unknown[]) => {},
};

let globalLogger: ILogger = noopLogger;

export function setGlobalLogger(logger: ILogger): void {
  globalLogger = logger;
}

export const log = {
  log: (...args: unknown[]) => globalLogger.log(...args),
  error: (...args: unknown[]) => globalLogger.error(...args),
  info: (...args: unknown[]) => globalLogger.info(...args),
};
