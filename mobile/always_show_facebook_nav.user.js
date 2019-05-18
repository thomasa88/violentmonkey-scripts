// ==UserScript==
// @name Always show Facebook navigation bar
// @namespace thomasa88
// @match *://m.facebook.com/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// ==/UserScript==

// Hide the back button bar
var navbar = document.getElementById("MBackNavBar");
if (navbar !== null) {
  navbar.style.display = "none";
}
