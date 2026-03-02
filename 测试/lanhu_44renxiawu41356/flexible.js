(function flexible(window, document) {
  function resetFontSize() {
    // 改为以 750px 为标准设计稿宽度，1rem = 75px
    const baseWidth = 750;
    const clientWidth = document.documentElement.clientWidth;
    const size = (clientWidth / baseWidth) * 75;
    document.documentElement.style.fontSize = size + 'px';
  }

  window.addEventListener('pageshow', resetFontSize);
  window.addEventListener('resize', resetFontSize);
  resetFontSize();
})(window, document);
