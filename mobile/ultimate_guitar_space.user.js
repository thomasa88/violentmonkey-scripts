// ==UserScript==
// @name        ultimate-guitar more space
// @namespace   thomasa88
// @match       https://tabs.ultimate-guitar.com/tab/*
// @grant       none
// @version     1.0
// @author      -
// @description 12/27/2019, 7:38:34 PM
// ==/UserScript==

document.querySelector('div.js-splash-container').style.display='none'
document.querySelector('div.js-tab-controls-wrapper').style.display='none'
document.querySelector('div.spl-fixed-action').style.display='none'
document.querySelector('section.ugm-b-section__chords').style.display='none'

document.querySelector('div.js-ab-regular').style.display='none'

document.querySelectorAll('div.js-ab-regular').forEach(o => { o.style.display='none' })
