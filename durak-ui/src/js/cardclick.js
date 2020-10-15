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

import {display} from './display';
import {beats} from './misc';

async function beatCard(app, data, selectedCard, attackingCard) {
  if (!beats(selectedCard, attackingCard, data.trump)) {
    app.$$('#attack').addClass('card-cannot-beat');
    setTimeout(() => { app.$$('#attack').removeClass('card-cannot-beat'); }, 500);
    return;
  }

  const playerKey = localStorage.getItem('playerKey');
  const response = await app.$f7.request.promise.postJSON(
    `durak/v1/playerKey/${playerKey}/defend/${attackingCard.rank}${attackingCard.suite}/${selectedCard.rank}${selectedCard.suite}`
  );
  const newData = response.data;
  localStorage.setItem('gameData', JSON.stringify(newData));
  localStorage.removeItem('selectedCard');
  display(app, newData);
}

async function handCardClick(app, sender) {
  if (!sender.target) {
    return;
  }
  const card = {
    rank: sender.target.getAttribute('data-rank'),
    suite: sender.target.getAttribute('data-suite'),
  };

  const data = JSON.parse(localStorage.getItem('gameData'));
  const playerKey = localStorage.getItem('playerKey');
  if (data.status === 'WAITING FOR ATTACK' && data.playerId === data.attackingPlayerId) {
    const response = await app.$f7.request.promise.postJSON(
      `durak/v1/playerKey/${playerKey}/attack/${card.rank}${card.suite}`
    );
    const newData = response.data;
    localStorage.setItem('gameData', JSON.stringify(newData));
    display(app, newData);
    return;
  }
  if ((data.status === 'WAITING FOR DEFENCE' ||
       data.status === 'WAITING FOR MORE' ||
       data.status === 'WAITING FOR MORE TO TAKE'
      ) &&
      data.playerId !== data.defendingPlayerId
  ) {
    // can this card be added?
    let matches = false;
    for (const cardOnTable of [...data.attackingCards, ...data.defendingCards.filter(card => card)]) {
      if (cardOnTable.rank === card.rank) {
        matches = true;
        break;
      }
    }
    if (!matches) {
      app.$$('#attack').addClass('card-cannot-beat');
      setTimeout(() => { app.$$('#attack').removeClass('card-cannot-beat'); }, 500);
      return;
    }

    // is there enough cards to defend?
    const cardsNotBeaten = data.defendingCards.filter(card => !card).length;
    const cardsInDefendersHand = data.players[data.defendingPlayerId].count;
    if (cardsNotBeaten >= cardsInDefendersHand || data.attackingCards.length >= 6) {
      return;
    }

    const response = await app.$f7.request.promise.postJSON(
      `durak/v1/playerKey/${playerKey}/addCard/${card.rank}${card.suite}`
    );
    const newData = response.data;
    localStorage.setItem('gameData', JSON.stringify(newData));
    localStorage.removeItem('selectedCard');
    display(app, newData);
    return;
  }

  if ((data.status === 'WAITING FOR DEFENCE' ||
       data.status === 'WAITING FOR MORE'
      ) &&
      data.playerId === data.defendingPlayerId &&
      data.attackingCards.length - data.defendingCards.filter(card => card).length === 1
  ) {
    const attackingCardIdx = data.defendingCards.findIndex(card => !card);
    const attackingCard = data.attackingCards[attackingCardIdx];
    beatCard(app, data, card, attackingCard);
    return;
  }

  const selectedCardJson = localStorage.getItem('selectedCard');
  const selectedCard = selectedCardJson ? JSON.parse(selectedCardJson) : null;
  if (selectedCard && selectedCard.rank === card.rank && selectedCard.suite === card.suite) {
    localStorage.removeItem('selectedCard');
  } else {
    localStorage.setItem('selectedCard', JSON.stringify(card));
  }
  display(app, data);
}

function attackingCardClick(app, sender) {
  if (!sender.target) {
    return;
  }
  const selectedCardJson = localStorage.getItem('selectedCard');
  const selectedCard = selectedCardJson ? JSON.parse(selectedCardJson) : null;
  if (!selectedCard) {
    return;
  }

  const data = JSON.parse(localStorage.getItem('gameData'));
  if (data.status !== 'WAITING FOR DEFENCE' && data.status !== 'WAITING FOR MORE') {
    return;
  }
  if (data.playerId !== data.defendingPlayerId) {
    return;
  }

  const attackingCard = {
    rank: sender.target.getAttribute('data-rank'),
    suite: sender.target.getAttribute('data-suite'),
  };

  beatCard(app, data, selectedCard, attackingCard);
}

export {handCardClick, attackingCardClick};
