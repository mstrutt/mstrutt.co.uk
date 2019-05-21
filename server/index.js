const express = require('express');
const squirrelly = require('squirrelly')

const { 
  readdirPromise,
  readFilePromise
} = require('../utils/fs.js');

squirrelly.autoEscaping(false);

const app = express();

app.use(express.static('./dist'));

app.get('/blog/', (req, res) => {
  readdirPromise('./blog')
    .then((files) => {
      const pattern = /^\d+-\d+-.+\.json$/;
      const postList = files
        .filter(filename => filename.match(pattern))
        .sort()
        .reverse()
        .map(filename => readFilePromise(`./blog/${filename}`));
      return Promise.all([
        readFilePromise('./app/blog-listing.template.html'),
        readFilePromise(`./dist/template.html`),
        ...postList
      ]);
    })
    .then(([blogListing, template, ...files]) => {
      const filesJSON = files.map(file => JSON.parse(file));
      const content = squirrelly.Render(blogListing, {
        posts: filesJSON
      });
      const page = squirrelly.Render(template, {
        title: 'Blog',
        main: content
      });
      res.send(page);
    })
    .catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.send('500');
    });
});

app.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  // const info = JSON.stringify({
  //   headers: req.headers,
  //   url: req.url,
  //   params: req.params
  // }, null, 2);
  // console.log(info);
  // res.send(`<pre>${info}</pre>`);

  const {
    year,
    month,
    slug
  } = req.params;

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
        console.error(err);
        res.statusCode = 500;
        res.send('500');
      }
    });
});

app.listen(8080);
