import express from 'express';
import squirrelly from 'squirrelly';

import { 
  readdirPromise,
  readFilePromise
} from '../utils/fs.mjs';

squirrelly.autoEscaping(false);

const app = express();

app.use(express.static('./dist'));

app.get('/blog/', (req, res) => {
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
app.get('/blog/:year(\\d+)/(:month(\\d+)/)?', (req, res) => {
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

app.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  const { year, month, slug } = req.params;

  Promise.all([
    readFilePromise(`./blog/${year}-${month}-${slug}.json`),
    readFilePromise('./app/blog-post.template.html'),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([content, postTemplate, template]) => {
      const contentJSON = JSON.parse(content);
      const postHtml = squirrelly.Render(postTemplate, contentJSON);
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
