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

const dictionary = {
  en: {
    'Вы взяли, ждём ещё...': 'You picked up, waiting for more...',
    'Вы победили!': 'You won!',
    'Вы проиграли!': 'You lost!',
    'Ваш ход!': 'Your turn!',
    'Код игры': 'Game code',
    'Код игры для новых игроков': 'Game code for new players',
    'Ваше имя?': 'Enter your name:',
    'Игра окончена': 'Game over',
    'Игра окончена!': 'Game over!',
    'Ждём, подбросят ли...': 'Waiting for more cards...',
    'берёт': 'picks up',
    'ходит': 'attacks',
    'Новая игра': 'New game',
    'бьётся': 'defends',
    'Ожидаем игроков.': 'Waiting for players.',
    'Ожидаем игроков...': 'Waiting for players...',
    'Победитель': 'Winner',
    'Защищайтесь!': 'Defend!',
    'Дурак': 'Durak',
    'Работает на Node.js, Express, Framework7.io.': 'Powered by Node.js, Express, Framework7.io.',
  },
};

function _(message, language) {
  if (!language) {
    language = localStorage.getItem('lang');
  }
  if (!language) {
    return message;
  }

  const langDict = dictionary[language];
  if (!langDict) {
    return message;
  }

  const translation = langDict[message];
  if (typeof translation === 'undefined') {
    return message;
  }

  return translation;
}

export {_};
