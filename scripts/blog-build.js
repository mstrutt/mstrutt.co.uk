const frontMatter = require('front-matter');
const fs = require('fs');
const marked = require('marked');

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
          const json = Object.assign({}, content.attributes, { body });
          const string = JSON.stringify(json, null, 2);
          const outputFilename = formatFilename(filename);
          return writeFilePromise(`${DIST_FOLDER}/${outputFilename}`, string);
        });
    });
    return Promise.all(processing);
  })
  .catch(err => console.error(err));

function formatFilename(filename) {
  const parts = filename.match(/(\d+-\d+)-\d+-(.+)\.(markdown|md)/)
  return `${parts[1]}-${parts[2]}.json`;
}

function readdirPromise(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, 'utf8', function(err, files) {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    })
  });
}

function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

function writeFilePromise(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, function(err) {
      if (err) {
        reject(err);
        return;
      }
      console.log(`Written: ${filename}`)
      resolve(filename);
    });
  });
}
