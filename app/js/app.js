import StickyAvatar from './classes/sticky-avatar.js';

[...document.getElementsByClassName('avatar')].map(avatar => new StickyAvatar(avatar));
