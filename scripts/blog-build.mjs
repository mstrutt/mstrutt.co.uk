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
          const reading_time = estimateReadingTime(content.body, body);
          const json = Object.assign({}, content.attributes, {
            body,
            date_formatted,
            reading_time,
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

function estimateReadingTime(markdownBody, htmlBody) {
  // Based off medium's calculation with a slightly lower base speed
  // https://blog.medium.com/read-time-and-you-bc2048ab620c

  const AVERAGE_WORDS_PER_MINUTE = 250;
  const BASE_SECONDS_PER_IMAGE = 12;
  const MIN_SECONDS_PER_IMAGE = 3;

  const words = markdownBody.split(' ').filter((word) => !!word);
  const textReadingTime = (words.length / AVERAGE_WORDS_PER_MINUTE) * 60;

  let imageCount = 0;
  const images = htmlBody.match(/<img .+>/g) || [];
  const imageReadingTime = images.reduce((total) => {
    return total + Math.max(BASE_SECONDS_PER_IMAGE - imageCount++, MIN_SECONDS_PER_IMAGE);
  }, 0);

  const readingTime = textReadingTime + imageReadingTime;
  return `${Math.round(readingTime / 60) || 1} min`;
}
