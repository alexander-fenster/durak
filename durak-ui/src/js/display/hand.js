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

import {numericRank} from '../misc';
import {handCardClick} from '../cardclick';
import {Card} from '../cards';

function sortCards(cards) {
  const sortBy = localStorage.getItem('sortBy');
  const sortedCards = Array.from(cards);
  if (sortBy === 'rank') {
    sortedCards.sort((a, b) => {
      const aRank = numericRank(a.rank);
      const bRank = numericRank(b.rank);
      if (aRank < bRank) {
        return 1;
      }
      if (aRank > bRank) {
        return -1;
      }
      if (a.suite < b.suite) {
        return -1;
      }
      if (a.suite > b.suite) {
        return 1;
      }
      return 0;
    });
  } else if (sortBy === 'suite') {
    sortedCards.sort((a, b) => {
      if (a.suite < b.suite) {
        return -1;
      }
      if (a.suite > b.suite) {
        return 1;
      }
      const aRank = numericRank(a.rank);
      const bRank = numericRank(b.rank);
      if (aRank < bRank) {
        return 1;
      }
      if (aRank > bRank) {
        return -1;
      }
      return 0;
    });
  }
  return sortedCards;
}

function displayHand(app, data) {
  const sortedCards = sortCards(data.cards);
  const selectedCardJson = localStorage.getItem('selectedCard');
  const selectedCard = selectedCardJson ? JSON.parse(selectedCardJson) : null;
  const hand = app.$$("#hand");
  let handHtml = '';
  for (const card of sortedCards) {
    const htmlCard = new Card(card);
    const properties = {
      class: 'card-in-hand'
    };
    if (selectedCard && card.rank === selectedCard.rank && card.suite === selectedCard.suite) {
      properties['class'] += ' card-selected';
    }
    const span = data.status === 'NOT STARTED' ? '<span></span>' : htmlCard.span(properties);
    handHtml += `<div class="swiper-slide">${span}</div>\n`;
  }
  hand.html(handHtml);
  app.$$('.card-in-hand').click((sender) => { handCardClick(app, sender); });

  const swiper = app.$f7.swiper.get("#hand-container");
  if (swiper) {
    swiper.update();
  }
}

export {displayHand};
