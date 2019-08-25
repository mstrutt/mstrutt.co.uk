import express from 'express';

import {defaultCatch} from '../utils/error-handling.mjs';
import {readdirPromise} from '../utils/fs.mjs';
import renderPostList from '../utils/render-post-list.mjs';

const router = new express.Router();

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

export default router;
