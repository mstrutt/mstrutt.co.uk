import squirrelly from 'squirrelly';

import {readFilePromise, readdirPromise} from './fs.mjs';

squirrelly.autoEscaping(false);
readdirPromise('./app/partials/')
  .then((partials) => {
    const pattern = /([-a-z]+)\.html/;
    const readingPartials = partials
      .filter(file => file.match(pattern))
      .map((partialFilename) => {
        return readFilePromise(`./app/partials/${partialFilename}`)
          .then((partial) => {
            const partialName = partialFilename.match(pattern)[1];
            squirrelly.definePartial(partialName, partial);
          });
      });
    return Promise.all(readingPartials);
  });

export default squirrelly;
