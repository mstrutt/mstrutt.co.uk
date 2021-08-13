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

const categoryMapping = {};

readdirPromise(`${SRC_FOLDER}`)
  .then((filenames) => {
    const processing = filenames.map((filename) => {
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
          const outputFilename = formatFilename(filename);
          const stringified = JSON.stringify(json, null, 2);
          updateCategoryMap(json.categories, outputFilename);
          return writeFilePromise(`${DIST_FOLDER}/${outputFilename}`, stringified);
        });
    });
    return Promise.all(processing);
  })
  .then(() => {
    const stringified = JSON.stringify(categoryMapping, null, 2);
    writeFilePromise(`${DIST_FOLDER}/_category-mapping.json`, stringified);
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

function updateCategoryMap(categories, filename) {
  if (!categories || !categories.length) {
    return;
  }

  categories.forEach((category) => {
    if (!categoryMapping[category]) {
      categoryMapping[category] = [];
    }
    categoryMapping[category].push(filename);
    categoryMapping[category].sort().reverse();
  });
}
