import squirrelly from 'squirrelly';
import envFolder from './env-folder.mjs';

import {readFilePromise, readdirPromise} from './fs.mjs';

squirrelly.autoEscaping(false);
readdirPromise(`./${envFolder}/partials/`)
  .then((partials) => {
    const pattern = /([-a-z]+)\.html/;
    const readingPartials = partials
      .filter(file => file.match(pattern))
      .map((partialFilename) => {
        return readFilePromise(`./${envFolder}/partials/${partialFilename}`)
          .then((partial) => {
            const partialName = partialFilename.match(pattern)[1];
            squirrelly.definePartial(partialName, partial);
          });
      });
    return Promise.all(readingPartials);
  });

export default squirrelly;
