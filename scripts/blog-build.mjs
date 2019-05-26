import frontMatter from 'front-matter';
import marked from 'marked';

import { 
  readdirPromise,
  readFilePromise,
  writeFilePromise
} from '../utils/fs.js';

const SRC_FOLDER = './_blog-posts';
const DIST_FOLDER = './blog';

marked.setOptions({
  gfm: true
});

readdirPromise(`${SRC_FOLDER}`)
  .then((filesnames) => {
    const processing = filesnames.map((filename) => {
      return readFilePromise(`${SRC_FOLDER}/${filename}`)
        .then(file => {
          const content = frontMatter(file);
          const body = marked(content.body);
          const date_formatted = new Date(content.attributes.date).toDateString();
          const url = getPostUrl(filename);
          const json = Object.assign({}, content.attributes, {
            date_formatted,
            url,
            body
          });
          const string = JSON.stringify(json, null, 2);
          const outputFilename = formatFilename(filename);
          return writeFilePromise(`${DIST_FOLDER}/${outputFilename}`, string);
        });
    });
    return Promise.all(processing);
  })
  .catch(err => console.error(err));

function formatFilename(filename) {
  const parts = filename.match(/(\d+-\d+)-\d+-(.+)\.(markdown|md)/);
  return `${parts[1]}-${parts[2]}.json`;
}

function getPostUrl(filename) {
  const parts = filename.match(/(\d+)-(\d+)-\d+-(.+)\.(markdown|md)/);
  return `/blog/${parts[1]}/${parts[2]}/${parts[3]}/`;
}
