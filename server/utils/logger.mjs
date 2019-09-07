import winston from 'winston';

export default winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: process.env.NODE_ENV === 'production' ? [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ] : [
    new winston.transports.Console({ format: winston.format.simple() }),
  ]
});
