import envFolder from './env-folder.mjs';
import {readFilePromise} from './fs.mjs';
import logger from './logger.mjs';
import squirrelly from './squirrelly.mjs';

export function defaultCatch(res) {
  return (err) => {
    logger.error(err);
    res.statusCode = 500;
    res.send('500');
  };
}

export function notFoundHandler(res, contentData = {}) {
  return Promise.all([
    readFilePromise(`./${envFolder}/templates/error.html`),
    readFilePromise(`./dist/template.html`),
  ])
    .then(([postTemplate, template]) => {
      const postHtml = squirrelly.Render(postTemplate, {
        body: 'Page not found...',
        title: 'Not found',
        ...contentData,
      });
      const page = squirrelly.Render(template, {
        main: postHtml,
        page: 'error',
        title: '404',
        ...contentData,
      });
      res.statusCode = 404;
      res.send(page);
    })
    .catch(defaultCatch(res));
}
