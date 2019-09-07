import envFolder from './env-folder.mjs';
import {readFilePromise} from './fs.mjs';
import squirrelly from './squirrelly.mjs';

export default function renderPostList(postList, title = 'Blog', params = {}) {
  return Promise.all([
    readFilePromise(`./${envFolder}/templates/blog-listing.html`),
    readFilePromise(`./dist/template.html`),
    ...postList.map((filename) => readFilePromise(`./blog/${filename}`)),
  ])
    .then(([listTemplate, pageTemplate, ...files]) => {
      const filesJSON = files.map((file) => JSON.parse(file));
      const main = squirrelly.Render(listTemplate, {
        params,
        posts: filesJSON,
        title,
      });
      return squirrelly.Render(pageTemplate, {
        main,
        page: 'blog',
        params,
        title,
      });
    });
}
