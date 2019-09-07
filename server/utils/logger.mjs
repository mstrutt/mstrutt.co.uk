import winston from 'winston';

export default winston.createLogger({
  format: winston.format.json(),
  level: 'info',
  transports: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ] : [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
