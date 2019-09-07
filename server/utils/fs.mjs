import fs from 'fs';
import logger from './logger.mjs';

export function readdirPromise(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, 'utf8', (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

export function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
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
    fs.writeFile(filename, data, (err) => {
      if (err) {
        reject(err);
        return;
      }
      logger.debug(`Written: ${filename}`);
      resolve(filename);
    });
  });
}

export function mkdirPromise(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err && err.code !== 'EEXIST') {
        reject(err);
        return;
      }
      resolve(path);
    });
  });
}
