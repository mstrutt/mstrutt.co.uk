// @ts-check

import { debounce } from './utils';

export const IMAGE_PADDING = 40;

export const CLASSES = {
  BUTTON: 'image-resize__button',
  IMAGE: 'image-resize__image',
  WRAPPER: 'image-resize',
};

export default class ImageHandler {
  static attachTo(element) {
    return new ImageHandler(element);
  }

  constructor(element) {
    this.element = element;
    this.button = document.createElement('button');
    this.wrapper = document.createElement('div');
    this.inFlowWidth = null;
    this.inFlowHeight = null;
    this.potentialWidth = null;
    this.potentialHeight = null;
    this.availableSpace = null;
    this.isBig = false;
    this.allowResize = this.checkSizing();

    this.boundToggle = this.toggleImageSize.bind(this);
    this.boundResize = this.onResize.bind(this);
    this.debouncedResize = debounce(this.boundResize, 100)

    this.init();
  }

  init() {
    this.element.parentNode.appendChild(this.wrapper);
    this.wrapper.appendChild(this.element);
    this.wrapper.appendChild(this.button);
    this.wrapper.classList.add(CLASSES.WRAPPER);
    this.element.classList.add(CLASSES.IMAGE);
    this.button.classList.add(CLASSES.BUTTON);
    this.button.setAttribute('aria-label', 'Toggle image size');
    if (!this.allowResize) {
      this.button.style.display = 'none';
    }
    this.bindEvents_();
  }

  toggleImageSize(event) {
    if (this.allowResize) {
      event.preventDefault();
    }
    if (this.isBig) {
      this.resetImageSize();
    } else {
      this.setBigImageSize();
    }
    this.isBig = !this.isBig;
  }

  resetImageSize() {
    this.element.style.maxWidth = this.wrapper.style.marginLeft = this.wrapper.style.marginRight = '';
  }

  setBigImageSize() {
    const maxWidth = Math.min(this.potentialWidth, this.availableSpace);
    this.element.style.maxWidth = `${maxWidth}px`;
    const offset = (this.inFlowWidth - maxWidth) / 2
    this.wrapper.style.marginLeft = this.wrapper.style.marginRight = `${offset}px`;
  }

  checkSizing() {
    let maxWidth = this.element.style.maxWidth;
    let margin = this.element.style.marginLeft;
    this.resetImageSize(); // use defualt value
    this.inFlowWidth = this.element.offsetWidth;
    this.inFlowHeight = this.element.offsetHeight;
    this.element.style.maxWidth = 'none'; // don't constrain size
    this.potentialWidth = this.element.offsetWidth;
    this.potentialHeight = this.element.offsetHeight;
    this.element.style.maxWidth = maxWidth;// reset
    this.element.style.marginLeft = this.element.style.marginRight = margin; // reset
    this.availableSpace = window.innerWidth - IMAGE_PADDING;
    return this.inFlowWidth < this.potentialWidth && (this.availableSpace / this.inFlowWidth) > 1.1;
  }

  onResize() {
    this.allowResize = this.checkSizing();
    this.isBig = this.allowResize && this.isBig;
    if (this.isBig) {
      this.setBigImageSize(); // Adjust sizing after resize
    } else {
      this.resetImageSize();
    }
    this.button.style.display = this.allowResize ? '' : 'none';
  }

  bindEvents_() {
    this.button.addEventListener('click', this.boundToggle);
    this.element.addEventListener('load', this.boundResize, true);
    window.addEventListener('resize', this.debouncedResize, true);
  }
  
  unbindEvents_() {
    this.button.removeEventListener('click', this.boundToggle);
    this.element.removeEventListener('load', this.boundResize, true);
    window.removeEventListener('resize', this.debouncedResize, true);
  }
}
