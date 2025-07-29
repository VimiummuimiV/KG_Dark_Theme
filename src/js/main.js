(function () {
  'use strict';

  // Include themeLoader.js content directly
  function loadDarkTheme(cssContent) {
    const style = document.createElement('style');
    style.className = 'kg-dark-theme';
    style.textContent = cssContent;
    // Try to append to head, fallback to documentElement
    const target = document.head || document.documentElement;
    target.appendChild(style);
  }

  // Include avatarBiggener.js content directly
  function replaceBigAvatars() {
    const selectors = [
      '.info[style*="avatars/"]',
      '.user-content dd[style*="avatars/"]',
      '#live .user-link[style*="avatars/"]',
      '#top td[style*="avatars/"]',
      '#toplist td[style*="avatars/"]'
    ];

    document.querySelectorAll(selectors.join(", ")).forEach(element => {
      const style = element.getAttribute('style');
      const newStyle = style.replace(/avatars\/(\d+)\.png/g, 'avatars/$1_big.png');
      element.setAttribute('style', newStyle);
      element.style.backgroundSize = 'contain';
    });
  }

  function applyAvatarBiggener() {
    addEventListener('DOMContentLoaded', () => {
      replaceBigAvatars();
    });
    // Also observe for dynamic content changes
    const observer = new MutationObserver(() => {
      replaceBigAvatars();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  const cssContent = CSS_CONTENT_PLACEHOLDER;

  function initializeApp() {
    // Call the functions directly
    loadDarkTheme(cssContent);
    applyAvatarBiggener();
  }

  // Execute immediately if possible
  if (document.head) {
    initializeApp();
  } else {
    // Wait for head to be available
    const observer = new MutationObserver((mutations, obs) => {
      if (document.head) {
        initializeApp();
        obs.disconnect();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
})();