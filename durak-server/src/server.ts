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

import {Game, games} from './game';
import {Player} from './player';
import {Rank, Suite, Card} from './constants';

function toCard(cardName: string): Card {
  const match = cardName.match(/^(6|7|8|9|10|J|Q|K|A)([♣♦♥♠CDHS])$/);
  if (!match) {
    throw new Error(`Cannot parse card name ${cardName}`);
  }
  const rankName = match[1];
  let suiteName = match[2];
  if (suiteName === 'C') suiteName = '♣';
  if (suiteName === 'D') suiteName = '♦';
  if (suiteName === 'H') suiteName = '♥';
  if (suiteName === 'S') suiteName = '♠';
  let rank: Rank | undefined;
  let suite: Suite | undefined;
  for (const r in Rank) {
    if (Rank[r as keyof typeof Rank] === rankName) {
      rank = Rank[r as keyof typeof Rank];
      break;
    }
  }
  for (const s in Suite) {
    if (Suite[s as keyof typeof Suite] === suiteName) {
      suite = Suite[s as keyof typeof Suite];
      break;
    }
  }
  if (typeof rank === 'undefined' || typeof suite === 'undefined') {
    throw new Error(`Cannot decode card name ${cardName}.`);
  }

  return {rank, suite};
}

export function newGame(playerName: string) {
  const host = new Player(1, playerName);
  new Game(host);
  return host.getTable();
}

export function joinGame(playerName: string, gameId: number) {
  const game = games[gameId];
  if (typeof game === 'undefined') {
    throw new Error(`Game ID ${gameId} was not found.`);
  }
  const currentNumPlayers = game.getPlayersCount();
  const player = new Player(currentNumPlayers + 1, playerName);
  game.addPlayer(player);
  return player.getTable();
}

export function nextGame(player: Player) {
  return player.nextGame();
}

export function start(player: Player) {
  player.start();
  return player.getTable();
}

export function getTable(player: Player) {
  return player.getTable();
}

export function attack(player: Player, attackingCardName: string) {
  const attackingCard = toCard(attackingCardName);
  player.attack(attackingCard);
  return player.getTable();
}

export function defend(
  player: Player,
  attackingCardName: string,
  defendingCardName: string
) {
  const attackingCard = toCard(attackingCardName);
  const defendingCard = toCard(defendingCardName);
  player.defend(attackingCard, defendingCard);
  return player.getTable();
}

export function addCard(player: Player, attackingCardName: string) {
  const attackingCard = toCard(attackingCardName);
  player.addCard(attackingCard);
  return player.getTable();
}

export function pass(player: Player) {
  player.pass();
  return player.getTable();
}

export function pickUp(player: Player) {
  player.pickUp();
  return player.getTable();
}
