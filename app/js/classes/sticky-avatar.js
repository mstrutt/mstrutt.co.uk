// @ts-check

export const STICKY_CLASS = 'avatar--sticky';

export default class StickyAvatar {
  constructor(element) {
    this.element = element;
    this.midpoint = null;
    this.onScroll();

    this.bindEvents_();
  }

  onResize() {
    this.midpoint = null;
  }

  onScroll() {
    if (!this.midpoint) {
      const { top, height } = this.element.getBoundingClientRect();
      this.midpoint = top + (height / 2);
    }
    if (window.scrollY > this.midpoint) {
      this.element.classList.add(STICKY_CLASS);
    } else {
      this.element.classList.remove(STICKY_CLASS);
    }
  }

  bindEvents_() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
  }
}
