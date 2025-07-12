// ==UserScript==
// @name         KG_Dark_Theme
// @namespace    klavogonki
// @version      1.0.0
// @description  Load dark theme CSS
// @author       Patcher
// @match        *://klavogonki.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=klavogonki.ru
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function loadDarkTheme() {
        // Generate a random 20-digit number
        const randomParam = Math.floor(Math.random() * 10 ** 20);

        // Create a link element for CSS
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `http://localhost:8080/KG_Dark_Theme/dist/KG_Dark_Theme.css?rand=${randomParam}`;
        link.classList.add('KG_Dark_Theme');

        // Try to append to head, fallback to documentElement
        const target = document.head || document.documentElement;
        target.appendChild(link);
    }

    // Execute immediately if possible
    if (document.head) {
        loadDarkTheme();
    } else {
        // Wait for head to be available
        const observer = new MutationObserver((mutations, obs) => {
            if (document.head) {
                loadDarkTheme();
                obs.disconnect();
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();