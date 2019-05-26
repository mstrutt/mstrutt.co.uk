import fs from 'fs';

export function readdirPromise(directory) {
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

export function readFilePromise(filename) {
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

export function writeFilePromise(filename, data) {
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
