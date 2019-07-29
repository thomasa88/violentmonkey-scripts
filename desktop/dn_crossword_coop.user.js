// ==UserScript==
// @name DN - Korsord tillsammans
// @version 1.0.0
// @namespace thomasa88
// @match *://korsord.dn.se/*
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
// 
// Copyright  Thomas Axelsson 2019
// 
// This userscript is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This userscript is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this userscript.  If not, see <https://www.gnu.org/licenses/>.

const CHANNEL_ID = 'vCoEbx9CLexyUN8NF1Ed';
const BASE_URL = 'wss://connect.websocket.in/' + CHANNEL_ID + '?room_id=';

let ws_;
let ignoreLetterChange_ = 0;
let button_;
let crossword_ = null;

function connect(roomId) {
  console.log("CONNECT", roomId);
  if (ws_ != null) {
    ws_.close();
  }
  ws_ = new WebSocket(BASE_URL + roomId);
  ws_.onmessage = msg;
  ws_.onopen = onConnected;
  ws_.onclose = onDisconnected;
}

function disconnect() {
  console.log("DISCONNECT")
  ws_.close();
  ws_ = null;
}

function onConnected(e) {
  console.log("CONNECTED");
  button_.style.background = '#ff0000';
  button_.style.color = '#ffffff';
  button_.style.fontWeight = 'bold';
}

function onDisconnected(e) {
  console.log("DISCONNECTED");
  button_.style.background = '';
  button_.style.color = '';
  button_.style.fontWeight = '';
}

function onLetterChange(records) {
  records.forEach(
    record => {
      if (ignoreLetterChange_ > 0) {
        ignoreLetterChange_--;
        return;
      }
      let square = record.target;
      let letter = square.attributes['data-char'].value;
      if (ws_.readyState = WebSocket.OPEN) {
        console.log("SEND", letter)
        ws_.send(JSON.stringify([square.id, letter]));
        square.style.color = '#000000';
      }
    }
  );
}


function msg(event) {
  console.log("GOT", event.data);
  json = JSON.parse(event.data);
  let square_id = json[0];
  let letter = json[1];
  let square = document.getElementById(square_id);
  // Will get null if users have different crosswords open
  if (square != null) {
    square.innerText = letter;
    ignoreLetterChange_++;
    square.attributes['data-char'].value = letter;
    square.style.color = '#ff0000';
  }
}

function addButton() {
  button_ = document.createElement('button');
  button_.innerText = '👥 Samarbeta';
  button_.className = 'crossword-button';
  button_.onclick = onCoopClick;
  let menu = document.querySelector("div.crossword-menu__button-container");
  menu.appendChild(button_);
}

function onCoopClick(e) {
  // TODO: Handle all WebSocket states
  if (ws_ == null || ws_.readyState == WebSocket.CLOSED) {
    // Use something better. Time? Combine with user input?
    let roomId = GM_getValue("roomId", Math.random().toString().substr(2, 20));
    roomId = prompt("Ange spel-id (alla måste ange samma)", roomId);
    if (roomId != null) {
      GM_setValue("roomId", roomId);
      // TODO: Handle all server room ID limitations
      connect(roomId.substr(0, 20));
    }
  } else if (ws_.readyState == WebSocket.OPEN) {
    disconnect();
  }
}

function waitLoad() {
  crossword_ = document.querySelector('div.crossword-words-container');
  if (crossword_ != null) {
    onLoaded();
  } else {
    setTimeout(waitLoad, 1000);
  }
}

function onLoaded() {
  addButton();
  o = new MutationObserver(onLetterChange);
  o.observe(crossword_, {attributes: true, attributeFilter: ['data-char'], subtree: true});
  console.log("OBSERVING");
}

waitLoad();
