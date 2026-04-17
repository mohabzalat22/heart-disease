import path from 'path';
import fs from 'fs';
import 'dotenv/config';
const dir = path.join(process.cwd(), 'logs');
const logFile = path.join(dir, 'app.log');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

function formatMessage(level: string, message: string, meta?: string) {
  const time = new Date().toISOString();
  return (
    JSON.stringify({
      time,
      level,
      message,
      meta,
    }) + '\n'
  );
}

function writeLog(level: string, message: string, meta?: string) {
  fs.appendFileSync(logFile, formatMessage(level, message, meta));
}

export const logger = {
  info: (message: string, meta?: string) => writeLog('info', message, meta),
  warn: (message: string, meta?: string) => writeLog('warn', message, meta),
  error: (error: unknown, meta?: string) => {
    if (error instanceof Error) {
      writeLog(
        'error',
        error.message,
        JSON.stringify({
          stack: error.stack,
          name: error.name,
          meta,
        })
      );
    } else {
      writeLog('error', String(error), meta);
    }
  },
};
