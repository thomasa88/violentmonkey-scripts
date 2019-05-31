// ==UserScript==
// @name DN crossword Ctrl to scroll
// @description Only automaticolly scroll the crossword when Ctrl is pressed
// @namespace thomasa88
// @match *://korsord.dn.se/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// @version 1.0
// ==/UserScript==

// The scrolling is disabled if we pretend to be a mobile phone
// TODO: Find a way that is less brutal

var ctrl = false;
var realNav = window.navigator;

function getNav() {
  if (ctrl) {
    return window.realNav;
  } else {
    return "Android";
  }
}

Object.defineProperty(window.navigator, "userAgent", {
    get: getNav
});

window.onkeydown = function(e) { if (e.keyCode == 17 || e.ctrlKey) { ctrl = true; } };
window.onkeyup = function(e) { if (e.keyCode == 17) { ctrl = false; } }

