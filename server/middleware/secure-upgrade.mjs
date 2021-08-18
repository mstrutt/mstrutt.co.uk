import https from 'https';

import logger from '../utils/logger';

const SECURE_CHECK_TIMEOUT_MS = 1000;

export default function (req, res, next) {
  if (req.secure) {
    next();
    return;
  }

  const secureUrl = `https://${req.headers.host}${req.url}`;
  let responded = false;
  let secureCheckTimeout;

  const done = () => {
    responded = true;
    clearTimeout(secureCheckTimeout);
  };

  const options = {
    hostname: req.headers.host,
    path: req.url,
    method: 'GET'
  };
  
  const secureCheckRequest = https.request(options, (secureCheckResponse) => {
    secureCheckResponse.on('data', () => {
      if (responded) {
        return;
      }
      logger.info(`Secure site statusCode: ${secureCheckResponse.statusCode}`);
      if (secureCheckResponse.statusCode === 200) {
        res.redirect(secureUrl);
      } else {
        next();
      }
      done();
    });
  });
  
  secureCheckRequest.on('error', (e) => {
    if (responded) {
      return;
    }
    logger.error('Could not connect to secure site.');
    logger.error(e);
    next();
    done();
  });
  secureCheckRequest.end();

  secureCheckTimeout = setTimeout(() => {
    logger.warn('Timeout waiting for secure site.');
    secureCheckRequest.destroy();
  }, SECURE_CHECK_TIMEOUT_MS);
}
