import express from 'express';

import {defaultCatch, notFoundHandler} from '../utils/error-handling.mjs';
import {readFilePromise} from '../utils/fs.mjs';
import squirrelly from '../utils/squirrelly.mjs';

const router = new express.Router();

router.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  const { year, month, slug } = req.params;
  const contentData = {
    params: {
      year,
      month
    }
  };

  Promise.all([
    readFilePromise(`./blog/${year}-${month}-${slug}.json`),
    readFilePromise('./app/blog-post.template.html'),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([content, postTemplate, template]) => {
      const contentJSON = JSON.parse(content);
      const postHtml = squirrelly.Render(postTemplate, {
        ...contentJSON,
        ...contentData
      });
      const page = squirrelly.Render(template, {
        ...contentJSON,
        main: postHtml,
        page: 'blog-post',
      });
      res.send(page);
    })
    .catch((err) => {
      if (err.code === 'ENOENT') {
        notFoundHandler(res, {
          ...contentData,
          page: 'blog-post',
        });
      } else {
        defaultCatch(res)(err)
      }
    });
});

export default router;
