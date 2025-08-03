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
    // Avatar URL pattern to match
    const match = /avatars\/(\d+)\.png/g;

    // Target common elements that typically have avatar backgrounds or sources
    const selectors = [
      'a[style*="avatars/"]',
      'dd[style*="avatars/"]',
      'td[style*="avatars/"]',
      'i[style*="avatars/"]',
      'img[src*="avatars/"]',
      'div[style*="avatars/"]'
    ];

    // All possible attributes that might contain avatar URLs
    const attributes = [
      'style',
      'src',
      'href'
    ];

    document.querySelectorAll(selectors.join(", ")).forEach(element => {
      // Check and replace in all possible attributes
      attributes.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && match.test(value)) {
          // Reset regex lastIndex to ensure proper matching
          match.lastIndex = 0;
          const newValue = value.replace(match, 'avatars/$1_big.png');
          element.setAttribute(attr, newValue);

          // Apply background-size for style attributes
          if (attr === 'style') {
            element.style.backgroundSize = 'contain';
          }
        }
      });
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
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Add viewport meta tag - only for mobile devices
  function addViewportMeta() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!isMobile) {
      return; // Exit if not a mobile device
    }

    // Check if viewport meta tag already exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    if (!viewportMeta) {
      // Create new viewport meta tag
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Set the viewport content for 1:1 scale on mobile
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
  const cssContent = CSS_CONTENT_PLACEHOLDER;

  function initializeApp() {
    // Call the functions directly
    loadDarkTheme(cssContent);
    applyAvatarBiggener();
    addViewportMeta();
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