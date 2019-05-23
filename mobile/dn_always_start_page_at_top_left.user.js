// ==UserScript==
// @name Always link to DN start page in the top left corner
// @description Remove the "E-DN" link, which appears when scrolling to the top, and replace it with "START".
// @namespace thomasa88
// @match *://www.dn.se/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// @version 1.0
// ==/UserScript==

var link = document.querySelector("a[href='http://dagens.dn.se/'");

link.href = "https://www.dn.se";
link.innerText = "Start";

// To use logo instead:
//link.innerHTML = '<svg width="30" height="16" class="icon icon--dn-small"><use xlink:href="#dn-small"></use> </svg>'
