// ==UserScript==
// @name         KG_Dark_Theme_SERVER
// @namespace    klavogonki
// @version      1.0.0
// @description  Enhance the chat abilities
// @author       Patcher
// @match        *://klavogonki.ru/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=klavogonki.ru
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      127.0.0.1
// ==/UserScript==

(function() {
    'use strict';

    const randomParam = Math.floor(Math.random() * 10 ** 20);
    const url = `http://localhost:8080/KG_Dark_Theme/dist/KG_Dark_Theme.js?rand=${randomParam}`;

    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function(response) {
            if (response.status === 200) {
                const script = document.createElement('script');
                script.textContent = response.responseText;
                script.classList.add('KG_Dark_Theme');
                (document.head || document.documentElement).appendChild(script);
            } else {
                console.error('KG_Dark_Theme: failed to load', response.status);
            }
        },
        onerror: function(err) {
            console.error('KG_Dark_Theme: network error', err);
        }
    });
})();