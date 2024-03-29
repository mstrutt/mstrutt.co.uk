import express from 'express';

import envFolder from '../utils/env-folder.mjs';
import {defaultCatch, notFoundHandler} from '../utils/error-handling.mjs';
import {readFilePromise} from '../utils/fs.mjs';
import fullUrl from '../utils/full-url.mjs';
import squirrelly from '../utils/squirrelly.mjs';

const router = new express.Router();

router.get('/blog/:year(\\d+)/:month(\\d+)/:slug([a-z0-9-]+)/', (req, res) => {
  const { year, month, slug } = req.params;
  const contentData = {
    params: {
      month,
      year,
    },
  };

  Promise.all([
    readFilePromise(`./blog/${year}-${month}-${slug}.json`),
    readFilePromise(`./${envFolder}/templates/blog-post.html`),
    readFilePromise(`./dist/template.html`),
  ])
    .then(([content, postTemplate, template]) => {
      const contentJSON = JSON.parse(content);
      if (contentJSON.image) {
        contentJSON.image = fullUrl(contentJSON.image, req);
      }
      const postHtml = squirrelly.Render(postTemplate, {
        ...contentJSON,
        ...contentData,
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
        defaultCatch(res)(err);
      }
    });
});

export default router;
