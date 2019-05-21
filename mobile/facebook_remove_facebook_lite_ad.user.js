// ==UserScript==
// @name Remove the ad for "Facebook Lite"
// @namespace thomasa88
// @match *://m.facebook.com/*
// @match *://touch.facebook.com/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// @version 1.0
// ==/UserScript==

var promos = document.querySelectorAll("div[data-sigil='m-promo']")
if (promos.length > 0) {
  for(var i = 0; i < promos.length; i++) {
    promos[i].parentElement.removeChild(promos[i]);
  }
}
