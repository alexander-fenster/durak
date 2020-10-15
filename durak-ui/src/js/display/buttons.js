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

import {_} from '../l10n';

function displayButtons(app, data) {
 // Show the start button if we host the game
  if (Object.keys(data.players).length > 1 && data.status === 'NOT STARTED' && data.playerId === 1) {
    app.$$('#start').show();
  } else {
    app.$$('#start').hide();
  }

  // Waiting message
  if (data.status === 'NOT STARTED' && Object.keys(data.players).length === 1) {
    app.$$('#waitingForPlayers').html(
      `${_('Ожидаем игроков...')}<br>${_('Код игры для новых игроков')}: ${String(data.gameId).padStart(4, '0')}.`
    );
    app.$$('#waitingForPlayers').show();
  } else if (data.status === 'NOT STARTED' && data.playerId !== 1) {
    app.$$('#waitingForPlayers').html(
      `${_('Ожидаем начала игры')}...<br>${_('Код игры для новых игроков')}: ${String(data.gameId).padStart(4, '0')}.`
    );
    app.$$('#waitingForPlayers').show();
  } else {
    app.$$('#waitingForPlayers').hide();
  }

  if (data.status === 'WAITING FOR ATTACK' || data.status === 'WAITING FOR DEFENCE') {
    localStorage.removeItem('passPressed');
  }
  if (data.status === 'WAITING FOR MORE' &&
      data.attackingCards.length > data.defendingCards.filter(card => card).length
  ) {
    localStorage.removeItem('passPressed');
  }

  // Pass button
  if (!localStorage.getItem('passPressed') &&
      data.status === 'WAITING FOR MORE' &&
      data.playerId !== data.defendingPlayerId &&
      data.attackingCards.length === data.defendingCards.filter(card => card).length
  ) {
    app.$$('#pass').html('Бито');
    app.$$('#pass').show();
  } else if (!localStorage.getItem('passPressed') &&
              data.status == 'WAITING FOR MORE TO TAKE' &&
              data.playerId !== data.defendingPlayerId) {
    app.$$('#pass').html('Всё');
    app.$$('#pass').show();
  } else {
    app.$$('#pass').hide();
  }

  // Pick up button
  if ((data.status === 'WAITING FOR DEFENCE' || data.status === 'WAITING FOR MORE') &&
    data.playerId === data.defendingPlayerId &&
    data.attackingCards.length > data.defendingCards.filter(card => card).length) {
    app.$$('#pickUp').show();
  } else {
    app.$$('#pickUp').hide();
  }

  // Once more button
  if (data.status === 'FINISHED') {
    app.$$('#onceMore').show();
  } else {
    app.$$('#onceMore').hide();
  }
}

export {displayButtons};
