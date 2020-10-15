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

function displayDiscardPile(app, data) {
  let discardCount = 36 -
    data.deckCount -
    data.attackingCards.length -
    data.defendingCards.filter(card => card).length;
  for (const player in data.players) {
    discardCount -= data.players[player].count;
  }

  const rotations = JSON.parse(localStorage.getItem('discardRotations'));
  const backgroundColor = localStorage.getItem('backgroundColor');

  let discardHtml = '';
  for (let idx = 0; idx < discardCount; ++idx) {
    const rotateDeg = rotations[idx];
    discardHtml += new Card().span({
      class: 'discarded-card',
      style: `transform: rotate(${rotateDeg}deg);background-color: ${backgroundColor};`,
    });
  }
  app.$$("#discard").html(discardHtml);
  if (discardCount == 0) {
    app.$$("#discard").hide();
  } else {
    app.$$("#discard").show();
  }
}

export {displayDiscardPile};
