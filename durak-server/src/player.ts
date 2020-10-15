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

import {v4 as uuidv4} from 'uuid';
import {Card, cleanupTimeout} from './constants';
import {Game} from './game';

export const players: {[key: string]: Player} = {};

function cleanupPlayers() {
  const now = new Date().getTime();
  for (const key in players) {
    if (now - players[key].getCreateTime().getTime() > cleanupTimeout) {
      console.log(`Deleting player ${key} by timeout.`);
      delete players[key];
    }
  }
}

export class Player {
  id: number;
  key: string;
  name: string;
  cards: Card[];
  game?: Game;
  nextPlayer?: Player;
  createTime: Date;

  constructor(id: number, name: string, cards?: Card[]) {
    cleanupPlayers();
    this.createTime = new Date();
    this.id = id;
    this.key = uuidv4();
    this.name = name;
    this.cards = cards ?? [];
    players[this.key] = this;
  }

  getCreateTime() {
    return this.createTime;
  }

  reset() {
    this.cards = [];
    this.createTime = new Date();
  }

  getGameId() {
    return this.game?.getGameId();
  }

  nextGame() {
    if (!this.game) {
      throw new Error('There is no current game.');
    }

    const nextGame = this.game.nextGame(this);
    if (this.game.getGameId() !== nextGame.getGameId()) {
      nextGame.addPlayer(this);
    }

    return this.getTable();
  }

  joinGame(game: Game) {
    this.reset();
    this.game = game;
  }

  setNextPlayer(player: Player) {
    this.nextPlayer = player;
  }

  getNextPlayer() {
    return this.nextPlayer;
  }

  start() {
    if (!this.game) {
      throw new Error('There is no game to start');
    }

    this.game.start();
  }

  getTable() {
    if (!this.game) {
      throw new Error('There is no game to get the table.');
    }

    const table = this.game.getTable();
    return {
      playerId: this.id,
      playerKey: this.key,
      cards: this.cards,
      ...table,
    };
  }

  take(card: Card) {
    this.cards.push(card);
  }

  remove(card: Card) {
    const newCards = this.cards.filter(
      myCard => myCard.rank !== card.rank || myCard.suite !== card.suite
    );
    if (newCards.length === this.cards.length) {
      throw new Error(
        `Card ${JSON.stringify(card)} is not in the possession of player ${
          this.id
        } ${this.name}.`
      );
    }
    this.cards = newCards;
  }

  count() {
    return this.cards.length;
  }

  attack(card: Card) {
    if (!this.game) {
      throw new Error('The game has not started yet, cannot attack.');
    }

    this.game.attack(this, card);
  }

  addCard(card: Card) {
    if (!this.game) {
      throw new Error('The game has not started yet, cannot add card.');
    }

    this.game.addCard(this, card);
  }

  defend(attackingCard: Card, defendingCard: Card) {
    if (!this.game) {
      throw new Error('The game has not started yet, cannot defend.');
    }

    this.game.defend(this, attackingCard, defendingCard);
  }

  pass() {
    if (!this.game) {
      throw new Error('The game has not started yet, cannot pass.');
    }

    this.game.pass(this);
  }

  pickUp() {
    if (!this.game) {
      throw new Error('The game has not started yet, cannot pick up cards.');
    }

    this.game.pickUp(this);
  }
}
