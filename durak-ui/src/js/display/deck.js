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

import {Card} from '../cards';

function displayDeck(app, data) {
  if (data.deckCount > 0) {
    app.$$("#deck-count").html(data.deckCount);
  } else {
    app.$$("#deck-count").html('');
  }
  if (data.deckCount >= 2) {
    app.$$("#deck").html(new Card().span());
  } else {
    app.$$("#deck").html('');
  }
  if (data.deckCount >= 1) {
    app.$$("#trump").html(new Card(data.trumpCard).span());
    app.$$("#trump-suite").html('');
  } else {
    app.$$("#trump").html('');
    app.$$("#trump-suite").html(data.trump);
    if (data.trump === '♣' || data.trump === '♠') {
      app.$$("#trump-suite").addClass('black');
    } else {
      app.$$("#trump-suite").addClass('red');
    }
  }
  const backgroundColor = localStorage.getItem('backgroundColor');
  app.$$("#deck").css('background-color', backgroundColor);

  if (data.status === 'NOT STARTED') {
    app.$$(".deck").hide();
  } else {
    app.$$(".deck").show();
  }
}

export {displayDeck};
