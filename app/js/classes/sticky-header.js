// @ts-check

import { debounce } from './utils';

export const BAR_HEIGHT = 60;

export default class StickyHeader {
  constructor(element) {
    this.element = element;
    this.debouncedResize = debounce(this.onResize.bind(this), 80);
    this.onResize();

    this.bindEvents_();
  }

  onResize() {
    this.element.style.top = `${BAR_HEIGHT - this.element.offsetHeight}px`;
  }

  bindEvents_() {
    window.addEventListener('resize', this.debouncedResize, false);
    window.addEventListener('load', this.onResize.bind(this), false);
  }
}

