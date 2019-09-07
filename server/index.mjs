import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import https from 'https';
import slash from 'express-slash';

// Setting up environment variables
dotenv.config();

import {readFilePromise} from './utils/fs.mjs';
import logger from './utils/logger.mjs';

// Middleware
import fourOhFourMiddleware from './middleware/four-oh-four.mjs';

// Routes
import blogListingRoutes from './routes/blog-listing.mjs';
import blogPostRoutes from './routes/blog-post.mjs';
import indexRoutes from './routes/index.mjs';
import redirectRoutes from './routes/redirects.mjs';
import rssRoutes from './routes/rss.mjs';

const app = express();
const router = new express.Router({
  caseSensitive: app.get('case sensitive routing'),
  strict: app.get('strict routing')
});
app.use(router);
app.use(compression());
app.enable('strict routing');

app.use(express.static('./dist'));

app.use(indexRoutes);
app.use(blogListingRoutes);
app.use(blogPostRoutes);
app.use(redirectRoutes);
app.use(rssRoutes);

app.use(fourOhFourMiddleware);

// Needs to be after all routes have been set up
app.use(slash());

if (process.env.NODE_ENV === 'production') {
  Promise.all([
    readFilePromise(`${process.env.CERTIFICATES_FOLDER}/key.pem`),
    readFilePromise(`${process.env.CERTIFICATES_FOLDER}/cert.pem`),
    readFilePromise(`${process.env.CERTIFICATES_FOLDER}/chain.pem`)
  ])
    .then(([key, cert, ca]) => {
      https.createServer({
        key,
        cert,
        ca
      }, app).listen(process.env.HTTPS_PORT);
    })
    .catch((err) => {
      logger.error(err);
    });
}

app.listen(process.env.HTTP_PORT);
