export const CLASSES = {
  HIDDEN: 'banner--hidden',
  BODY_HAS_BANNER: 'body-has-banner'
};

export const STATE = {
  HIDE: 'HIDE',
  SHOW: 'SHOW'
};

export default class CodeBanner {
  static attachTo(element) {
    return new CodeBanner(element);
  }

  constructor(element) {
    this.el = element;
    this.closeButton = this.el.querySelector('[code-banner-close]');
    this.storageNamespace = 'code-banner';

    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);

    // Using try catch so that we don't bind events if localStorage is unsupported
    try {
      this.setState();
    } catch(err) {
      this.closeButton.style.visibility = 'hidden';
      return;
    }

    this.bindEvents();
  }

  setState() {
    const state = window.localStorage.getItem(this.storageNamespace);
    if (state === STATE.HIDE) {
      this.hide();
    } else {
      this.show();
    }
  }

  bindEvents() {
    this.closeButton.addEventListener('click', this.hide)
  }

  hide() {
    this.el.classList.add(CLASSES.HIDDEN);
    document.body.classList.remove(CLASSES.BODY_HAS_BANNER);
    window.localStorage.setItem(this.storageNamespace, STATE.HIDE);
  }
  
  show() {
    this.el.classList.remove(CLASSES.HIDDEN);
    document.body.classList.add(CLASSES.BODY_HAS_BANNER);
    window.localStorage.setItem(this.storageNamespace, STATE.SHOW);
  }
}
