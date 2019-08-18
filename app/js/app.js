import ImageHandler from './classes/image-handler';

[...document.querySelectorAll('.blog-post img')].map(img => new ImageHandler(img));
