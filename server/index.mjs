import express from 'express';
import slash from 'express-slash';
import squirrelly from 'squirrelly';

import { 
  readdirPromise,
  readFilePromise
} from '../utils/fs.mjs';
import redirects from './redirects.json';

squirrelly.autoEscaping(false);
readFilePromise('./app/breadcrumbs.partial.html')
  .then(((breadcrumbs) => {
    squirrelly.definePartial('breadcrumbs', breadcrumbs);
  }));

const app = express();

app.enable('strict routing');
const router = express.Router({
  caseSensitive: app.get('case sensitive routing'),
  strict: app.get('strict routing')
});
app.use(router);
app.use(slash());

app.use(express.static('./dist'));

router.get('/blog/', (req, res) => {
  const pattern = /^\d+-\d+-.+\.json$/;

  readdirPromise('./blog')
    .then((files) => {
      const postList = files
        .filter(filename => filename.match(pattern))
        .sort()
        .reverse();
      return renderPostList(postList);
    })
    .then(page => res.send(page))
    .catch(defaultCatch(res));
});

// Year and month search
router.get('/blog/:year(\\d+)/(:month(\\d+)/)?', (req, res) => {
  const { year, month } = req.params;
  const pattern = new RegExp(`^${year || '\\d+'}-${month || '\\d+'}-.+\\.json$`);
  const title = `Blog posts from ${year}${month ? `/${month}` : ''}`;

  readdirPromise('./blog')
    .then((files) => {
      const postList = files
        .filter(filename => filename.match(pattern))
        .sort()
        .reverse();
      return renderPostList(postList, title, req.params);
    })
    .then(page => res.send(page))
    .catch(defaultCatch(res));
});

router.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  const { year, month, slug } = req.params;

  Promise.all([
    readFilePromise(`./blog/${year}-${month}-${slug}.json`),
    readFilePromise('./app/blog-post.template.html'),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([content, postTemplate, template]) => {
      const contentJSON = JSON.parse(content);
      const postHtml = squirrelly.Render(postTemplate, {
        ...contentJSON,
        params: {
          year,
          month
        }
      });
      const page = squirrelly.Render(template, {
        ...contentJSON,
        main: postHtml
      });
      res.send(page);
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.send('404');
      } else {
        defaultCatch(res)(err)
      }
    });
});

Object.entries(redirects).forEach(([route, redirect]) => {
  router.get(route, (req, res) => {
    res
      .status(301)
      .redirect(redirect);
  });
});

function renderPostList(postList, title='Blog', params={},) {
  return Promise.all([
    readFilePromise('./app/blog-listing.template.html'),
    readFilePromise(`./dist/template.html`),
    ...postList.map(filename => readFilePromise(`./blog/${filename}`))
  ])
    .then(([listTemplate, pageTemplate, ...files]) => {
      const filesJSON = files.map(file => JSON.parse(file));
      const main = squirrelly.Render(listTemplate, {
        title,
        params,
        posts: filesJSON
      });
      return squirrelly.Render(pageTemplate, {
        title,
        params,
        main
      });
    });
}

function defaultCatch(res) {
  return (err) => {
    console.error(err);
    res.statusCode = 500;
    res.send('500');
  };
}

app.listen(8080);
