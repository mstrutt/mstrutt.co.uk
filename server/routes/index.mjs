import express from 'express';

import {defaultCatch} from '../utils/error-handlng.mjs';
import {readFilePromise} from '../utils/fs.mjs';
import squirrelly from '../utils/squirrelly.mjs';

const router = new express.Router();

router.get('/', (req, res) => {
  Promise.all([
    readFilePromise(`./app/index.template.html`),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([main, template]) => {
      return squirrelly.Render(template, {
        title: 'Home',
        main,
        page: 'home',
      });
    })
    .then(content => res.send(content))
    .catch(defaultCatch(res));
});

export default router;
