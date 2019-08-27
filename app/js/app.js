import CodeBanner from './classes/code-banner';
import ImageHandler from './classes/image-handler';

document.querySelectorAll('[code-banner]').forEach(CodeBanner.attachTo);
document.querySelectorAll('.blog-post img').forEach(ImageHandler.attachTo);
