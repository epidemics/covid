export function isTouchDevice() {
  return !!(
    ("ontouchstart" in window || navigator.maxTouchPoints) // works on most browsers
  ); // works on IE10/11 and Surface
}
