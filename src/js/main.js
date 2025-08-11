(function () {
  'use strict';

  // ===== COLOR HELPER FUNCTIONS =====
  let targetLightness = 0.55; // Base target lightness (0-1)

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    const l = (max + min) / 2;
    if (!d) return [0, 0, l];
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
    return [h, s, l];
  };

  const hslToRgb = (h, s, l) => {
    if (!s) return [l, l, l].map(x => Math.round(x * 255));
    const hue2rgb = (p, q, t) => (t < 0 && t++, t > 1 && t--, t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map(x => Math.round(x * 255));
  };

  // Calculate perceptual lightness adjustment based on hue
  const getPerceptualLightness = (hue, baseLightness) => {
    // Normalize hue to 0-360 degrees
    const hueDegrees = hue * 360;

    // Blue range (roughly 200-280 degrees) needs significant boost
    // Purple-blue (280-320) needs moderate boost
    // Cyan-blue (180-200) needs slight boost
    let lightnessBoost = 0;

    if (hueDegrees >= 200 && hueDegrees <= 280) {
      // Peak blue range - maximum boost
      const blueIntensity = 1 - Math.abs(hueDegrees - 240) / 40; // Peak at 240°
      lightnessBoost = 0.15 * Math.max(0.3, blueIntensity); // 0.045 to 0.15 boost
    } else if (hueDegrees >= 180 && hueDegrees < 200) {
      // Cyan-blue transition
      const intensity = (hueDegrees - 180) / 20;
      lightnessBoost = 0.08 * intensity; // Up to 0.08 boost
    } else if (hueDegrees > 280 && hueDegrees <= 320) {
      // Purple-blue transition
      const intensity = 1 - (hueDegrees - 280) / 40;
      lightnessBoost = 0.1 * intensity; // Up to 0.1 boost
    }

    return Math.min(0.95, baseLightness + lightnessBoost);
  };

  // Generic color calibration function
  const calibrateElementColor = (el, cssClass = 'calibrated-color') => {
    const rgb = getComputedStyle(el).color.match(/\d+/g);
    if (!rgb) return;

    const [h, s, l] = rgbToHsl(+rgb[0], +rgb[1], +rgb[2]);

    // Calculate adjusted lightness with blue gamma boost
    const adjustedLightness = getPerceptualLightness(h, targetLightness);

    // Only update if significantly different from current
    if (Math.abs(l - adjustedLightness) > 0.05) {
      const [r, g, b] = hslToRgb(h, s, adjustedLightness);
      const hexColor = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
      el.style.setProperty('color', hexColor, 'important');
    }

    // Mark as calibrated to avoid reprocessing
    el.classList.add(cssClass);
  };

  // ===== THEME LOADER =====

  function loadDarkTheme(cssContent) {
    const style = document.createElement('style');
    style.className = 'kg-dark-theme';
    style.textContent = cssContent;
    // Try to append to head, fallback to documentElement
    const target = document.head || document.documentElement;
    target.appendChild(style);
  }

  // ===== AVATAR BIGGENING =====

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


  // ==== SCROLL HELPER FUNCTION ===

  function scrollChatToBottom() {
    if (document.querySelector('.chat-user-list')) return;

    const chatContainer = document.querySelector('.messages-content');
    if (!chatContainer) return;

    const scrollTop = chatContainer.scrollTop;
    const scrollHeight = chatContainer.scrollHeight;
    const clientHeight = chatContainer.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= 100) {
      chatContainer.scrollTop = scrollHeight;
    }
  }

  // ===== USERNAME COLOR CALIBRATOR =====

  // Enhanced username lightness with blue gamma boost (mutation observer)
  function initializeUsernameColorCalibrator() {
    // Watch for new usernames with mutation observer
    const observer = new MutationObserver(mutations => {
      // Disconnect observer if chat user list is present (Empowerment tampermonkey script)
      if (document.querySelector('.chat-user-list')) {
        observer.disconnect();
        return;
      }
      mutations.forEach(m => m.type === 'childList' && m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          node.querySelectorAll?.('.username:not(.calibrated-username-color)').forEach(el => {
            calibrateElementColor(el, 'calibrated-username-color');
          });
        }
      }));
      scrollChatToBottom();
    });

    // Only observe if chat user list is not present (Empowerment tampermonkey script)
    if (!document.querySelector('.chat-user-list')) {
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }


  // ===== SPAN COLOR CALIBRATOR =====

  // Calibrate spans with inline color styles (one-time on DOMContentLoaded) [Forum posts, Vocabulary comments, etc.]
  function initializeSpanColorCalibrator() {
    const calibrateAllSpans = () => {
      // Query all spans with inline color styles using color:#
      const spanElements = document.querySelectorAll('span[style*="color:#"]:not(.calibrated-span-color)');
      console.log(`Found ${spanElements.length} spans to calibrate`);

      spanElements.forEach(el => {
        calibrateElementColor(el, 'calibrated-span-color');
      });

      console.log('Span color calibration completed');
    };

    // Only run once on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', calibrateAllSpans);
    } else {
      // Document already loaded, run immediately
      calibrateAllSpans();
    }
  }

  // ==== VIEWPORT META TAG ADDITION ====

  // Add viewport meta tag - only for mobile devices (1:1 scale)
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

  const SPEEDOMETER_ARROW_COLOR = 'hsl(200, 40%, 60%)';
  const ARROW_START_ROTATION = -100;
  const ARROW_END_ROTATION = 100;

  function initializeSpeedometerArrow() {
    if (!location.href.includes('/g/?gmid=')) return;
    const speedpanel = document.getElementById('speedpanel');
    if (!speedpanel || document.querySelector('.speedpanel-arrow')) return;
    const arrow = document.createElement('div');
    arrow.classList.add('speedpanel-arrow');
    Object.assign(arrow.style, {
      position: 'absolute',
      bottom: '30px',
      right: '148px',
      pointerEvents: 'none',
      filter: `drop-shadow(0 0 6px ${SPEEDOMETER_ARROW_COLOR}) drop-shadow(0 0 12px ${SPEEDOMETER_ARROW_COLOR}40)`,
      transformOrigin: '50% 100%',
      transform: `rotate(${ARROW_START_ROTATION}deg)`,
      zIndex: '10'
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 4 38');
    svg.setAttribute('width', '4');
    svg.setAttribute('height', '38');
    svg.innerHTML = `<rect width="4" height="38" rx="2" fill="${SPEEDOMETER_ARROW_COLOR}"/>`;
    arrow.appendChild(svg);
    speedpanel.appendChild(arrow);
    const update = () => {
      const speedLabel = document.getElementById('speed-label');
      if (speedLabel) {
        const speed = Math.max(0, Math.min(1000, parseFloat(speedLabel.textContent) || 0));
        const rotationRange = ARROW_END_ROTATION - ARROW_START_ROTATION;
        const angle = ARROW_START_ROTATION + (speed / 1000) * rotationRange;
        arrow.style.transform = `rotate(${angle}deg)`;
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // ===== APPLY CSS CONTENT =====
  const cssContent = CSS_CONTENT_PLACEHOLDER;

  // ===== INITIALIZATION =====

  function initializeApp() {
    // Call the functions directly
    loadDarkTheme(cssContent);
    applyAvatarBiggener();
    addViewportMeta();
    initializeUsernameColorCalibrator(); // Uses mutation observer with helper functions
    initializeSpanColorCalibrator(); // One-time calibration on DOMContentLoaded with helper functions
    initializeSpeedometerArrow(); // Speedometer arrow for specific URL
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