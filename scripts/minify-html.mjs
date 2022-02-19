import htmlMinifier from 'html-minifier';
import {
  mkdirPromise,
  readdirPromise,
  readFilePromise,
  writeFilePromise,
} from '../server/utils/fs.mjs';
import logger from '../server/utils/logger.mjs';

const minifierOptions = {
  // Treat attributes in case sensitive manner (useful for custom HTML tags)
  caseSensitive: true,
  // Omit attribute values from boolean attributes
  collapseBooleanAttributes: true,
  // Don't leave any spaces between display:inline; elements when collapsing.
  // Must be used in conjunction with collapseWhitespace=true
  collapseInlineTagWhitespace: true,
  // Collapse white space that contributes to text nodes in a document tree
  collapseWhitespace: true,
  // Always collapse to 1 space (never remove it entirely).
  // Must be used in conjunction with collapseWhitespace=true
  conservativeCollapse: true,
  // Handle parse errors instead of aborting.
  continueOnParseError: true,
  // Use direct Unicode characters whenever possible
  decodeEntities: true,
  // Array of regex'es that allow to ignore certain fragments,
  // when matched (e.g. <?php ... ?>, {{ ... }}, etc.)
  ignoreCustomFragments: [/\{\{[^}]+\}\}/],
  // Keep the trailing slash on singleton elements
  keepClosingSlash: true,
  // Minify CSS in style elements and style attributes (uses clean-css) (could be true, Object,
  // Function(text, type))
  minifyCSS: true,
  // Minify JavaScript in script elements and event attributes (uses UglifyJS) (could be true, Object,
  // Function(text, inline))
  minifyJS: true,
  // Always collapse to 1 line break (never remove it entirely) when whitespace between tags include a line break.
  // Must be used in conjunction with collapseWhitespace=true
  preserveLineBreaks: true,
  // Type of quote to use for attribute values (' or ")
  quoteCharacter: '"',
  // Strip HTML comments
  removeComments: true,
  // Remove all attributes with whitespace-only values (could be true, Function(attrName, tag))
  removeEmptyAttributes: true,
  // Remove type="text/javascript" from script tags. Other type attribute values are left intact
  removeScriptTypeAttributes: true,
  // Remove type="text/css" from style and link tags. Other type attribute values are left intact
  removeStyleLinkTypeAttributes: true,
  // Sort attributes by frequency
  sortAttributes: true,
  // Sort style classes by frequency
  sortClassName: true,
};

function outputDir(inputDir) {
  return inputDir.replace('/app/', '/dist/');
}

const folders = [
  './app/partials',
  './app/templates',
  './dist',
];

Promise.all(
  folders
    .map((folder) => outputDir(folder))
    .map((folder) => mkdirPromise(folder)),
)
  .then(() => Promise.all(
    folders.map((folder) => readdirPromise(folder)),
  ))
  .then((folderDirectories) => {
    const fileList = folderDirectories
      .map((files, index) => {
        const pattern = /[-a-z]+\.html/;
        return files
          .filter((file) => file.match(pattern))
          .map((file) => ({
            folder: folders[index],
            name: file,
          }));
      })
      .reduce((a, b) => [...a, ...b]);
    const readingFiles = fileList.map((file) => {
      return readFilePromise(`${file.folder}/${file.name}`)
        .then((html) => ({
          ...file,
          html,
        }));
    });
    return Promise.all(readingFiles);
  })
  .then((files) => {
    const writingFiles = files.map((file) => {
      const minifiedFile = htmlMinifier.minify(file.html, minifierOptions);
      const outputFilename = `${outputDir(file.folder)}/${file.name}`;
      return writeFilePromise(outputFilename, minifiedFile)
        .then(() => {
          logger.info(`${file.folder}/${file.name} minified`);
        });
    });
    return Promise.all(writingFiles);
  })
  .then(() => logger.info('All files minified successfully.'))
  .catch((err) => logger.error(err));
