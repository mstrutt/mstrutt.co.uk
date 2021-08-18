import https from 'https';

import logger from '../utils/logger';

const SECURE_CHECK_TIMEOUT_MS = 1000;

export default function (req, res, next) {
  if (req.secure) {
    next();
    return;
  }

  const secureUrl = `https://${req.headers.host}${req.url}`;
  let secureCheckTimeout;

  const options = {
    hostname: req.get('host'),
    path: req.url,
    method: 'GET'
  };
  
  const secureCheckRequest = https.request(options, (secureCheckResponse) => {
    secureCheckResponse.on('data', () => {
      logger(`Secure site statusCode: ${secureCheckResponse.statusCode}`);
      clearTimeout(secureCheckTimeout);
      if (secureCheckResponse.statusCode === 200) {
        res.redirect(secureUrl);
      } else {
        next();
      }
    });
  });
  
  secureCheckRequest.on('error', (e) => {
    logger.error('Could not connect to secure site.');
    logger.error(e);
    clearTimeout(secureCheckTimeout);
    next();
  });
  secureCheckRequest.end();

  secureCheckTimeout = setTimeout(() => {
    logger.warn('Timeout waiting for secure site.');
    secureCheckRequest.destroy();
  }, SECURE_CHECK_TIMEOUT_MS);
}
