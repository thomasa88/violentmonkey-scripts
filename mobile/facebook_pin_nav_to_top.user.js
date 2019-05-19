// ==UserScript==
// @name Pin Facebook navigation bar to the top
// @namespace thomasa88
// @match *://m.facebook.com/*
// @match *://touch.facebook.com/*
// @grant none
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
// @version 1.0
// ==/UserScript==

var locked_ = false;

var header_ = document.getElementById("header");
var bookmarks = document.getElementById("bookmarks_flyout")

header_.style.left = 0;
header_.style.top = 0;

function setLocked(value) {
  if (locked_ == value) {
    return;
  }
  if (value) {          
    console.log("lock menu");
    header_.style.position = "fixed";
    // Don't hide content behind the fixed menu
    // Firefox (and others?) need px
    document.body.style.paddingTop = header_.offsetHeight + "px";
  } else {
    console.log("unlock menu");
    header_.style.position = "relative";
    document.body.style.paddingTop = "0px";
  }
  locked_ = value;
}

function update() {
  // The "bookmarks" menu is a child to "header", so we
  // need to unlock the menu to allow proper scrolling.
  var bookmarksVisible = !bookmarks.classList.contains("popover_hidden");
  setLocked(!bookmarksVisible);
}

var observer = new MutationObserver(function (event) {
  update();
})

observer.observe(bookmarks, {
  attributes: true, 
  attributeFilter: ['class'],
  childList: false, 
  characterData: false
});

update();
