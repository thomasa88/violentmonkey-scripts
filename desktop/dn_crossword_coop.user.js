// ==UserScript==
// @name DN - Korsord tillsammans
// @version 1.3.0
// @namespace thomasa88
// @license GNU GPL v3. Copyright Thomas Axelsson 2019
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
const BUTTON_BASE_TEXT = '👥 Samarbeta';
const RANDOM_WORDS = [ 'banan', 'ananas', 'kiwi', 'päron',
                      'äpple', 'apelsin', 'druva', 'melon', 
                      'smultron', 'blåbär', 'hallon' ];
const USER_COLORS = [ '#c0392b', '#e74c3c', '#9b59b6', '#8e44ad',
                     '#2980b9', '#3498db', '#1abc9c', '#16a085', 
                     '#27ae60', '#2ecc71', '#f39c12', '#e67e22',
                     '#d35400' ];

let USER_ID = GM_getValue('userId', null);
if (USER_ID == null) {
  USER_ID = Math.random() + new Date().toISOString();
  GM_setValue('userId', USER_ID);
}
console.log("USER ID", USER_ID);

let ws_;
let uiRoomId_ = '';
let userColor_ = '';
let ignoreLetterChange_ = 0;
let button_;
let buttonStatusText_;
let crossword_ = null;
let selectedSquare_ = null;
let others_ = {}

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
  button_.style.background = userColor_;
  button_.style.color = '#ffffff';
  button_.style.fontWeight = 'bold';
  // TODO: HTML sanitize text
  buttonStatusText_.innerText =  '(' + uiRoomId_ + ')';
}

function onDisconnected(e) {
  console.log("DISCONNECTED");
  button_.style.background = '';
  button_.style.color = '';
  button_.style.fontWeight = '';
  buttonStatusText_.innerText =  '';
}

function onCrosswordChange(records) {
  if (ws_ == null || ws_.readyState != WebSocket.OPEN) {
    // Not connected
    return;
  }
  let newSelectedSquare = selectedSquare_;
  records.forEach(
    record => {
      let square = record.target;
      if (record.attributeName == 'data-char') {
        if (ignoreLetterChange_ > 0) {
          ignoreLetterChange_--;
          return;
        }
        let letter = square.getAttribute('data-char');
        let oldLetter = 'XXX';
        if (square.hasAttribute('data-dn-coop-char')) {
          oldLetter = square.getAttribute('data-dn-coop-char');
        }
        if (letter != oldLetter) {
          square.style.color = userColor_;
          square.setAttribute('data-dn-coop-char', letter);
          send('letter', [square.id, letter]);
        }
      } else if (record.attributeName == 'class') {
        if (square.classList.contains('crossword-square--input')) {
          newSelectedSquare = square;
        }
      }
    }
  );
  if (newSelectedSquare != null && newSelectedSquare != selectedSquare_) {
    selectedSquare_ = newSelectedSquare;
    send('select', selectedSquare_.id);
  }
}

function send(event, data) {
  let pkg = [window.location.pathname, USER_ID, userColor_, event, data];
  console.log("SEND", pkg);
  ws_.send(JSON.stringify(pkg));
}

function msg(e) {
  let pkg = JSON.parse(e.data);
  console.log("GOT", pkg);
  let crosswordName = pkg[0];
  let sender = pkg[1];
  let color = pkg[2];
  let event = pkg[3];
  let data = pkg[4];
  if (crosswordName != window.location.pathname) {
    console.log("Message for wrong crossword");
    return;
  }
  if (!(sender in others_)) {
    others_[sender] = { 'selectedSquare': null };
  }
  switch (event) {
    case 'letter': {
      let square_id = data[0];
      let letter = data[1];
      let square = document.getElementById(square_id);
      // Will get null if users have different crosswords open
      if (square != null) {
        square.innerText = letter;
        ignoreLetterChange_++;
        square.setAttribute('data-char', letter);
        square.setAttribute('data-dn-coop-char', letter);
        square.style.color = color;
      }
      break;
    }
    case 'select': {
      let square_id = data;
      let square = document.getElementById(square_id);
      if (square != null) {
        let prevSquare = others_[sender]['selectedSquare'];
        if (prevSquare != null && prevSquare != square) {
          prevSquare.style.border = '';
        }
        // TODO: Handle users crossing each other's paths
        others_[sender]['selectedSquare'] = square;
        square.style.border = "solid 1px " + color;
      }
      break;
    }
  }
  
}

function addButton() {
  button_ = document.createElement('button');
  button_.innerText = BUTTON_BASE_TEXT;
  button_.className = 'crossword-button';
  button_.onclick = onCoopClick;
  buttonStatusText_ = document.createElement('span')
  buttonStatusText_.style.paddingLeft = '0.5em';
  button_.appendChild(buttonStatusText_);
  let menu = document.querySelector("div.crossword-menu__button-container");
  menu.appendChild(button_);
}

function onCoopClick(e) {
  // TODO: Handle all WebSocket states
  if (ws_ == null || ws_.readyState == WebSocket.CLOSED) {
    let prevRoomId = GM_getValue('roomId', '');
    let roomId = getRandomRoom();
    roomId = prompt("Ange spel-id (alla måste ange samma)." + 
                    (prevRoomId != '' ? "Lämna fältet tomt för att återanvända föregående (" + prevRoomId + ")." : ""),
                    roomId);
    if (roomId != null) {
      if (roomId == '') {
        if (prevRoomId == '') {
          prevRoomId = getRandomRoom();
        }
        roomId = prevRoomId;
      }
      GM_setValue("roomId", roomId);
      uiRoomId_ = roomId;
      userColor_ = getRandomUserColor();
      connect(sanitizeRoomId(roomId));
    }
  } else if (ws_.readyState == WebSocket.OPEN) {
    disconnect();
  }
}

function getRandomRoom() {
  return getRandomWord() + '-' + getRandomNumber(100, 1000);
}

function getRandomWord() {
  return RANDOM_WORDS[getRandomNumber(0, RANDOM_WORDS.length)];
}

function getRandomNumber(minIncl, maxExcl) {
  return Math.floor(Math.random() * (maxExcl - minIncl)) + minIncl;
}

function getRandomUserColor() {
  return USER_COLORS[getRandomNumber(0, USER_COLORS.length)];
}

// websocket.in restrictions
function sanitizeRoomId(id) {
  let sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  if (sanitized.length < 2) {
    sanitized += '__';
  }
  return sanitized.substr(0, 20);
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
  o = new MutationObserver(onCrosswordChange);
  o.observe(crossword_, {attributes: true, attributeFilter: ['data-char', 'class'], subtree: true});
  console.log("OBSERVING");
}

waitLoad();
