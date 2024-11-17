export const auto = (element, width, maxScale = 3, minScale = .8) => {
  element.style.transform = `scale(${Math.min(maxScale, Math.max(minScale, width / element.offsetWidth))})`;
  element.style.transformOrigin = 'left top';
};

export const OLDauto = (element, maxWidth, maxFontSize = 40, minFontSize = 16) => {
  element.style.fontSize = maxFontSize + 'px';

  if (element.getBoundingClientRect().width >= maxWidth && maxFontSize > minFontSize) {
    maxFontSize -= 1;
    auto(element, maxWidth, maxFontSize, minFontSize);
  }
};
