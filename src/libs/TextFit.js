export const autoFit = (element, maxWidth, maxFontSize = 32, minFontSize = 16) => {
  element.style.fontSize = maxFontSize + 'px';

  if (element.getBoundingClientRect().width >= maxWidth && maxFontSize > minFontSize) {
    maxFontSize -= 1;
    autoFit(element, maxWidth, maxFontSize, minFontSize);
  }
};
