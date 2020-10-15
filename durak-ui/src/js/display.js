// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { displayHand } from './display/hand';
import { displaySorting } from './display/sorting';
import { displayDeck } from './display/deck';
import { displayDiscardPile } from './display/discard';
import { displayStatus } from './display/status';
import { displayOthers } from './display/others';
import { displayButtons } from './display/buttons';
import { showCards } from './display/cards';

const gameTimeout = 60 * 60 * 1000; // 1 hour

function display(app, data) {
  app.$$('#json').html(JSON.stringify(data, null, '  '));
  app.$$('#sortCards').show();

  // Save the actual background color for future use
  if (!localStorage.getItem('backgroundColor')) {
    const deckCountStyles = getComputedStyle(app.$$("#page")[0]);
    const backgroundColor = deckCountStyles.getPropertyValue('background-color');
    localStorage.setItem('backgroundColor', backgroundColor);
  }

  // Hand
  displayHand(app, data);

  // Sorting selection
  displaySorting(app, data);

  // Deck
  displayDeck(app, data);

  // Discard pile
  displayDiscardPile(app, data);

  // Status bar
  displayStatus(app, data);

  // Other players' hands
  displayOthers(app, data);

  // Show buttons and/or waiting message
  displayButtons(app, data);

  // Show the attacking and defending cards
  showCards(app, data);
}

function displayFromSavedData(app) {
  const dataJson = localStorage.getItem('gameData');
  if (dataJson) {
    const data = JSON.parse(dataJson);
    const gameStartTime = new Date(data.startTime).getTime();
    if (new Date().getTime() - gameStartTime > gameTimeout) {
      return undefined;
    }
    display(app, data);
    return data;
  }
  return undefined;
}

export {display, displayFromSavedData};
