import ImageHandler from './classes/image-handler';
import StickyAvatar from './classes/sticky-avatar';

[...document.querySelectorAll('.blog-post img')].map(img => new ImageHandler(img));
[...document.getElementsByClassName('avatar')].map(avatar => new StickyAvatar(avatar));
