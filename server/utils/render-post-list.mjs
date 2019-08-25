import {readFilePromise} from './fs.mjs';
import squirrelly from './squirrelly.mjs';

export default function renderPostList(postList, title='Blog', params={},) {
  return Promise.all([
    readFilePromise('./app/blog-listing.template.html'),
    readFilePromise(`./dist/template.html`),
    ...postList.map(filename => readFilePromise(`./blog/${filename}`))
  ])
    .then(([listTemplate, pageTemplate, ...files]) => {
      const filesJSON = files.map(file => JSON.parse(file));
      const main = squirrelly.Render(listTemplate, {
        title,
        params,
        posts: filesJSON
      });
      return squirrelly.Render(pageTemplate, {
        title,
        params,
        main,
        page: 'blog',
      });
    });
}
