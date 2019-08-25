import {readFilePromise} from './fs.mjs';
import squirrelly from './squirrelly.mjs';

export function defaultCatch(res) {
  return (err) => {
    console.error(err);
    res.statusCode = 500;
    res.send('500');
  };
}

export function notFoundHandler(res, contentData={}) {
  return Promise.all([
    readFilePromise('./app/error.template.html'),
    readFilePromise(`./dist/template.html`)
  ])
    .then(([postTemplate, template]) => {
      const postHtml = squirrelly.Render(postTemplate, {
        title: 'Not found',
        body: 'Page not found...',
        ...contentData,
      });
      const page = squirrelly.Render(template, {
        title: '404',
        page: 'error',
        main: postHtml,
        ...contentData,
      });
      res.statusCode = 404;
      res.send(page);
    })
    .catch(defaultCatch(res));
}
