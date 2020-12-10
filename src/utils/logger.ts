import { createLogger, format, transports } from "winston";

export const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'cadavre-exquis' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `bot-combined.log`.
      // - Write all logs error (and below) to `bot-error.log`.
      //
      new transports.File({ filename: 'bot-error.log', level: 'error' }),
      new transports.File({ filename: 'bot-combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}
