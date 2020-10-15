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

function displayOthers(app, data) {
  let playerDisplayId = 0;
  for (const playerId in data.players) {
    if (playerId === String(data.playerId)) {
      continue;
    }
    ++playerDisplayId;
    app.$$(`#player${playerDisplayId}-name`).html(data.players[playerId].name);

    if (data.status !== 'NOT STARTED') {
      let cardsHtml = '';
      for (let idx = 0; idx < data.players[playerId].count; ++idx) {
        cardsHtml += new Card().span();
      }
      app.$$(`#player${playerDisplayId}-cards`).html(cardsHtml);
    } else {
      app.$$(`#player${playerDisplayId}-cards`).html('');
    }
    app.$$(`#player${playerDisplayId}`).show();
  }
  for (++playerDisplayId; playerDisplayId < 6; ++playerDisplayId) {
    app.$$(`#player${playerDisplayId}`).hide();
  }
}

export {displayOthers};