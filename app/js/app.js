import ImageHandler from './classes/image-handler';
import StickyAvatar from './classes/sticky-avatar';
import StickyHeader from './classes/sticky-header';

[...document.querySelectorAll('.blog-post img')].map(img => new ImageHandler(img));
[...document.getElementsByClassName('avatar')].map(avatar => new StickyAvatar(avatar));
[...document.getElementsByClassName('header')].map(header => new StickyHeader(header));
