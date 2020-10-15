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
import {attackingCardClick} from '../cardclick';

function showCards(app, data) {
  const attackDisplayOrder = [3, 4, 2, 5, 1, 6];
  for (let displayIdx of attackDisplayOrder) {
    app.$$(`#attack${displayIdx}`).html('');
  }

  for (let idx = 0;
       idx < Math.max(
               data.attackingCards.length,
               data.defendingCards.filter(card => card).length
             );
       ++idx) {
    const attackingCard = new Card(data.attackingCards[idx]);
    const attackingCardProperties = {
      class: 'attacking-card',
    };
    let defendingCardSpan = '';
    if (data.defendingCards[idx]) {
      const defendingCard = new Card(data.defendingCards[idx]);
      defendingCardSpan = defendingCard.span({
        class: 'defending-card',
      });
    } else {
      attackingCardProperties['class'] += ' card-not-defended';
    }
    const attackingCardSpan = attackingCard.span(attackingCardProperties);
    const attackHtml = `<span class="card-pair">${attackingCardSpan}${defendingCardSpan}</span>`;
    app.$$(`#attack${attackDisplayOrder[idx]}`).html(attackHtml);
  }
  app.$$('.card-not-defended').click((sender) => { attackingCardClick(app, sender); });
  const backgroundColor = localStorage.getItem('backgroundColor');
  app.$$('.card-pair').css('background-color', backgroundColor);
}

export {showCards};
