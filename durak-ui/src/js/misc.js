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

function gameReset(data) {
  localStorage.removeItem('selectedCard');
  localStorage.setItem('playerKey', data.playerKey);
  localStorage.setItem('playerId', data.playerId);
  localStorage.setItem('gameId', data.gameId);
  localStorage.removeItem('gameOver');
  localStorage.removeItem('passPressed');
  localStorage.removeItem('backgroundColor');
  localStorage.removeItem('subscribeErrorCount');
}

function numericRank(rank) {
  switch (rank) {
    case '6':
      return 6;
    case '7':
      return 7;
    case '8':
      return 8;
    case '9':
      return 9;
    case '10':
      return 10;
    case 'J':
      return 11;
    case 'Q':
      return 12;
    case 'K':
      return 13;
    case 'A':
      return 14;
  }
  return undefined;
}

function rankGreater(rank1, rank2) {
  return numericRank(rank1) > numericRank(rank2);
}

function beats(defendingCard, attackingCard, trump) {
  if (defendingCard.suite === attackingCard.suite) {
    return rankGreater(defendingCard.rank, attackingCard.rank);
  }
  if (defendingCard.suite === trump && attackingCard.suite !== trump) {
    return true;
  }
  return false;
}

export {gameReset, beats, numericRank};
