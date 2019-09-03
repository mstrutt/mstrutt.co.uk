import express from 'express';

import envFolder from '../utils/env-folder.mjs';
import {defaultCatch} from '../utils/error-handling.mjs';
import {readFilePromise} from '../utils/fs.mjs';
import squirrelly from '../utils/squirrelly.mjs';

const router = new express.Router();

router.get('/', (req, res) => {
  Promise.all([
    readFilePromise(`./${envFolder}/templates/index.html`),
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
