import express from 'express';
import slash from 'express-slash';

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

app.listen(8080);
