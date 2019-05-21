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
      res.send(`<pre>${files.sort()}</pre>`);
    });
});

app.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  const info = JSON.stringify({
    headers: req.headers,
    url: req.url,
    params: req.params
  }, null, 2);

  console.log(info);
  // res.send(`<pre>${info}</pre>`);

  const {
    year,
    month,
    slug
  } = req.params;

  Promise.all([
    readFilePromise(`./blog/${year}-${month}-${slug}.json`),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([content, template]) => {
      const contentJSON = JSON.parse(content);
      const page = squirrelly.Render(template, contentJSON);
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
