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

function displayStatus(app, data) {
  const status = app.$$("#status");
  const rightStatus = app.$$("#rightStatus");
  if (data.status === 'NOT STARTED') {
    status.html(_('Ожидаем игроков.'));
    rightStatus.html(`${_('Код игры')}: ${String(data.gameId).padStart(4, '0')}`);
  } else if (data.status === 'WAITING FOR ATTACK') {
    const attackingPlayerId = data.attackingPlayerId;
    if (data.playerId === attackingPlayerId) {
      status.html(_('Ваш ход!'));
    } else {
      const attackingPlayerName = data.players[attackingPlayerId].name;
      status.html(`${attackingPlayerName} ${_('ходит')}`);
    }
    rightStatus.html('');
  } else if (data.status === 'WAITING FOR DEFENCE' || data.status === 'WAITING FOR MORE') {
    const defendingPlayerId = data.defendingPlayerId;
    if (data.playerId === defendingPlayerId) {
      if (data.attackingCards.length === data.defendingCards.filter(card => card).length) {
        status.html(_('Ждём, подбросят ли...'));
      } else {
        status.html(_('Защищайтесь!'));
      }
    } else {
      const defendingPlayerName = data.players[defendingPlayerId].name;
      status.html(`${defendingPlayerName} ${_('бьётся')}`);
    }
    rightStatus.html('');
  } else if (data.status === 'WAITING FOR MORE TO TAKE') {
    const defendingPlayerId = data.defendingPlayerId;
    if (data.playerId === defendingPlayerId) {
      status.html(_('Вы взяли, ждём ещё...'));
    } else {
      const defendingPlayerName = data.players[defendingPlayerId].name;
      status.html(`${defendingPlayerName} ${_('берёт')}`);
    }
    rightStatus.html('');
  } else if (data.status === 'FINISHED') {
    status.html(_('Игра окончена'));
    rightStatus.html('');
    if (!localStorage.getItem('gameOver')) {
      localStorage.setItem('gameOver', 'true');
      const winnerPlayerName = data.players[data.winnerPlayerId].name;
      let message = _('Игра окончена!');
      if (data.loserPlayerId === data.playerId) {
        message += ' ' + _('Вы проиграли!');
      } else if (data.winnerPlayerId === data.playerId) {
        message += ' ' + _('Вы победили!');
      }
      if (data.winnerPlayerId !== data.playerId) {
        message += `<br>${_('Победитель')}: ${winnerPlayerName}`;
      }
      app.$f7.dialog.alert(message)
    }
  } else {
    status.html('');
    rightStatus.html('');
  }
  if (data.winnerPlayerId) {
    if (data.winnerPlayerId === data.playerId) {
      rightStatus.html(_('Вы победили!'));
    } else {
      const winnerPlayerName = data.players[data.winnerPlayerId].name;
      rightStatus.html(`${_('Победитель')}: ${winnerPlayerName}`);
    }
  }
}

export {displayStatus};