import frontMatter from 'front-matter';
import marked from 'marked';

import {
  readdirPromise,
  readFilePromise,
  writeFilePromise,
} from '../server/utils/fs.mjs';
import logger from '../server/utils/logger.mjs';

const SRC_FOLDER = './_blog-posts';
const DIST_FOLDER = './blog';

marked.setOptions({
  gfm: true,
});

readdirPromise(`${SRC_FOLDER}`)
  .then((filesnames) => {
    const processing = filesnames.map((filename) => {
      return readFilePromise(`${SRC_FOLDER}/${filename}`)
        .then((file) => {
          const content = frontMatter(file);
          const body = marked(content.body);
          const date_formatted = new Date(content.attributes.date).toDateString();
          const url = getPostUrl(filename);
          const json = Object.assign({}, content.attributes, {
            body,
            date_formatted,
            url,
          });
          const stringified = JSON.stringify(json, null, 2);
          const outputFilename = formatFilename(filename);
          return writeFilePromise(`${DIST_FOLDER}/${outputFilename}`, stringified);
        });
    });
    return Promise.all(processing);
  })
  .catch((err) => logger.error(err));

function formatFilename(filename) {
  const parts = filename.match(/(\d+-\d+)-\d+-(.+)\.(markdown|md)/);
  return `${parts[1]}-${parts[2]}.json`;
}

function getPostUrl(filename) {
  const parts = filename.match(/(\d+)-(\d+)-\d+-(.+)\.(markdown|md)/);
  return `/blog/${parts[1]}/${parts[2]}/${parts[3]}/`;
}
