// ==UserScript==
// @name Remove LinkedIn app promotions
// @namespace thomasa88
// @match *://*.linkedin.com/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// @version 1.0
// ==/UserScript==

// Hide app prompt ("Continue to mobile site")
//var appWall = document.getElementsByClassName("crosspromo-appwall__modal");
//appWall.parentElement.style.display = 'none';

// Dismiss app prompt ("Continue to mobile site")
var dialog = document.getElementById("appwall-wormhole");
if (dialog != null) {
  var appButton = dialog.querySelector("button[data-control-name='dismiss_xpromo_mwappwall_flagship']");
  if (appButton != null) {
    appButton.click();
  }
}


// Close top app install banner ("Install the LinkedIn app")
var topBanner = document.getElementById("smartbanner-wormhole");
if (topBanner != null) {
  var buttons = topBanner.getElementsByTagName("button");
  if (buttons.length > 0) {
    buttons[0].click();
  }
}
