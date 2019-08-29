import htmlMinifier from 'html-minifier';
import {
  mkdirPromise,
  readdirPromise,
  readFilePromise,
  writeFilePromise
} from '../server/utils/fs.mjs'

const minifierOptions = {
  caseSensitive: true, // Treat attributes in case sensitive manner (useful for custom HTML tags)
  collapseBooleanAttributes: true, // Omit attribute values from boolean attributes
  collapseInlineTagWhitespace: true, // Don't leave any spaces between display:inline; elements when collapsing. Must be used in conjunction with collapseWhitespace=true
  collapseWhitespace: true, // Collapse white space that contributes to text nodes in a document tree
  continueOnParseError: true, // Handle parse errors instead of aborting.
  decodeEntities: true, // Use direct Unicode characters whenever possible
  keepClosingSlash: true, // Keep the trailing slash on singleton elements
  minifyCSS: true, // Minify CSS in style elements and style attributes (uses clean-css) (could be true, Object, Function(text, type))
  minifyJS: true, // Minify JavaScript in script elements and event attributes (uses UglifyJS) (could be true, Object, Function(text, inline))
  quoteCharacter: '"', // Type of quote to use for attribute values (' or ") 	
  removeComments: true, // Strip HTML comments
  removeEmptyAttributes: true, // Remove all attributes with whitespace-only values (could be true, Function(attrName, tag))
  removeScriptTypeAttributes: true, // Remove type="text/javascript" from script tags. Other type attribute values are left intact
  removeStyleLinkTypeAttributes: true, // Remove type="text/css" from style and link tags. Other type attribute values are left intact
  sortAttributes: true, // Sort attributes by frequency
  sortClassName: true, // Sort style classes by frequency
};

function outputDir(inputDir) {
  return inputDir.replace('/app/', '/dist/');
}

const folders = [
  './app/partials',
  './app/templates'
];

Promise.all(
  folders
    .map((folder) => outputDir(folder))
    .map((folder) => mkdirPromise(folder))
)
  .then(() => Promise.all(
    folders.map(folder => readdirPromise(folder))
  ))
  .then((folderDirectories) => {
    const fileList = folderDirectories
      .map((files, index) => {
        const pattern = /[-a-z]+\.html/;
        return files
          .filter(file => file.match(pattern))
          .map((file) => ({
            folder: folders[index],
            name: file
          }));
      })
      .reduce((a, b) => [...a, ...b]);
    const readingFiles = fileList.map((file) => {
      return readFilePromise(`${file.folder}/${file.name}`)
        .then((html) => ({
          ...file,
          html
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
          console.log(`${file.folder}/${file.name} minified`);
        });
    });
    return Promise.all(writingFiles);
  })
  .then(() => console.log('Done!'))
  .catch((err) => console.error(err));
