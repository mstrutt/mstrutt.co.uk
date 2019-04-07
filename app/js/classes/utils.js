export function debounce(callback, threshold) {
  let timeout;

  function onTimeout(...args) {
    callback.call(...args);
    timeout = null;
  }

  return function() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(onTimeout, threshold);
  }
}