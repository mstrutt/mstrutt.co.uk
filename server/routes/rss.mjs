import express from 'express';

import {defaultCatch} from '../utils/error-handling.mjs';
import {readFilePromise, readdirPromise} from '../utils/fs.mjs';
import squirrelly from '../utils/squirrelly.mjs';

const router = new express.Router();

router.get('/rss.xml', (req, res) => {
  readdirPromise('./blog')
    .then((files) => {
      const pattern = /^\d+-\d+-.+\.json$/;
      const postList = files
        .filter(filename => filename.match(pattern))
        .sort()
        .reverse();
      return Promise.all([
        readFilePromise('./app/rss.template.xml'),
        ...postList.map(filename => readFilePromise(`./blog/${filename}`))
      ]);
    })
    .then(([rssTemplate, ...files]) => {
      const filesJSON = files.map(file => JSON.parse(file));
      const page = squirrelly.Render(rssTemplate, {
        posts: filesJSON
      });
      res.set('Content-Type', 'text/xml');
      res.send(page);
    })
    .catch(defaultCatch(res));
});

export default router;
