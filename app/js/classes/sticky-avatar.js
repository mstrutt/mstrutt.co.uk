export class StickyAvatar {
  // class constants
  static get STICKY_CLASS() { return 'avatar--sticky'; }
  
  constructor(element) {
    this.element = element;
    this.midpoint = null;

    this.bindEvents_();
  }

  onResize() {
    this.midpoint = null;
  }

  onScroll() {
    if (!this.midpoint) {
      this.midpoint = this.element.offsetTop + (this.element.offsetHeight / 2);
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
