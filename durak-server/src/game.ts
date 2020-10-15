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

import {Player} from './player';
import {
  Card,
  Suite,
  Rank,
  ranks,
  suites,
  cardsInHand,
  cleanupTimeout,
} from './constants';

export const games: {[id: number]: Game} = {};

export enum GameStatus {
  UNKNOWN = 'UNKNOWN',
  NOT_STARTED = 'NOT STARTED',
  WAITING_FOR_ATTACK = 'WAITING FOR ATTACK',
  WAITING_FOR_DEFENCE = 'WAITING FOR DEFENCE',
  WAITING_FOR_MORE = 'WAITING FOR MORE',
  WAITING_FOR_MORE_TO_TAKE = 'WAITING FOR MORE TO TAKE',
  FINISHED = 'FINISHED',
}

export interface Table {
  gameId: number;
  startTime: Date;
  attackingCards: Card[];
  defendingCards: Array<Card | undefined>;
  trumpCard?: Card;
  trump: Suite;
  deckCount: number;
  status: GameStatus;
  attackingPlayerId?: number;
  defendingPlayerId?: number;
  winnerPlayerId?: number;
  loserPlayerId?: number;
  players: {[id: number]: {name: string; count: number}};
  nextGameId?: number;
}

function shuffleDeck(deck: Card[]) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

export function findFirstPlayer(players: Player[], trump: Suite) {
  // who has the lowest trump card?
  let first = undefined;
  let lowestTrumpRank = undefined;
  for (const player of players) {
    let thisPlayerLowestTrumpRank = undefined;
    for (const card of player.cards) {
      if (
        card.suite === trump &&
        (typeof thisPlayerLowestTrumpRank === 'undefined' ||
          rankGreater(thisPlayerLowestTrumpRank, card.rank))
      ) {
        thisPlayerLowestTrumpRank = card.rank;
      }
    }
    if (
      typeof thisPlayerLowestTrumpRank !== 'undefined' &&
      (typeof lowestTrumpRank === 'undefined' ||
        rankGreater(lowestTrumpRank, thisPlayerLowestTrumpRank))
    ) {
      lowestTrumpRank = thisPlayerLowestTrumpRank;
      first = player;
    }
  }

  if (!first) {
    first = players[0];
  }

  return first;
}

export function rankGreater(rank1: Rank, rank2: Rank) {
  const numeric = (r: Rank) => {
    switch (r) {
      case Rank.SIX:
        return 6;
      case Rank.SEVEN:
        return 7;
      case Rank.EIGHT:
        return 8;
      case Rank.NINE:
        return 9;
      case Rank.TEN:
        return 10;
      case Rank.JACK:
        return 11;
      case Rank.QUEEN:
        return 12;
      case Rank.KING:
        return 13;
      case Rank.ACE:
        return 14;
    }
  };

  return numeric(rank1) > numeric(rank2);
}

export function beats(defendingCard: Card, attackingCard: Card, trump: Suite) {
  if (defendingCard.suite === attackingCard.suite) {
    return rankGreater(defendingCard.rank, attackingCard.rank);
  }
  if (defendingCard.suite === trump && attackingCard.suite !== trump) {
    return true;
  }
  return false;
}

function cleanupOldGames() {
  const now = new Date().getTime();
  for (const gameId in games) {
    if (now - games[gameId].getStartTime().getTime() > cleanupTimeout) {
      console.log(`Deleting expired game ${gameId}.`);
      delete games[gameId];
    }
  }
}

export class Game {
  private players: Player[];
  private id: number;
  private status: GameStatus;
  private attackingPlayer?: Player;
  private defendingPlayer?: Player;
  private deck: Card[] = [];
  private trump: Suite;
  private attackingCards: Card[] = [];
  private defendingCards: Array<Card | undefined> = [];
  private drawCardsOrder: Player[] = [];
  private passedPlayers: Player[] = [];
  private winner?: Player;
  private emptyHands: Player[] = [];
  private loser?: Player;
  private nextGameId?: number;
  private startTime: Date;
  private cardsInHand: number;

  constructor(
    host: Player,
    deckOverride?: Card[],
    cardsInHandOverride?: number
  ) {
    cleanupOldGames();

    this.startTime = new Date();
    this.players = [host];
    do {
      this.id = Math.floor(Math.random() * 10000);
    } while (this.id in games);
    games[this.id] = this;
    this.status = GameStatus.NOT_STARTED;

    if (!deckOverride) {
      for (const rank of ranks) {
        for (const suite of suites) {
          this.deck.push({rank, suite});
        }
      }
      shuffleDeck(this.deck);
    } else {
      // for unit tests
      this.deck = Array.from(deckOverride);
    }
    this.trump = this.deck[this.deck.length - 1].suite;

    this.cardsInHand = cardsInHandOverride ?? cardsInHand;

    host.joinGame(this);
    this.dealCards(host);
  }

  private dealCards(player: Player, maxCount?: number) {
    maxCount = maxCount ?? this.cardsInHand;
    while (this.deck.length > 0 && player.count() < maxCount) {
      player.take(this.deck.shift()!);
    }
  }

  private nextPlayer(player: Player): Player {
    let skippedPlayers = 0;
    player = player.nextPlayer!;
    while (player.count() === 0) {
      player = player.nextPlayer!;
      ++skippedPlayers;
      if (skippedPlayers >= 6) {
        this.status = GameStatus.UNKNOWN;
        throw new Error('Internal error: broken game state');
      }
    }
    return player;
  }

  nextGame(player: Player) {
    if (this.status !== GameStatus.FINISHED) {
      throw new Error(`The current game ${this.id} is not yet finished.`);
    }
    if (!this.nextGameId) {
      const nextGame = new Game(player);
      this.nextGameId = nextGame.getGameId();
    }
    return games[this.nextGameId];
  }

  getStartTime() {
    return this.startTime;
  }

  getGameId() {
    return this.id;
  }

  getPlayersCount() {
    return this.players.length;
  }

  getPlayerKeys() {
    return this.players.map(player => player.key);
  }

  getAttackingPlayer() {
    return this.attackingPlayer;
  }

  getDefendingPlayer() {
    return this.defendingPlayer;
  }

  getTable(): Table {
    const players: {[id: number]: {name: string; count: number}} = {};
    for (const player of this.players) {
      players[player.id] = {name: player.name, count: player.count()};
    }
    return {
      gameId: this.id,
      startTime: this.startTime,
      attackingCards: this.attackingCards,
      defendingCards: this.defendingCards,
      trumpCard:
        this.deck.length > 0 ? this.deck[this.deck.length - 1] : undefined,
      trump: this.trump,
      deckCount: this.deck.length,
      status: this.status,
      attackingPlayerId: this.attackingPlayer?.id,
      defendingPlayerId: this.defendingPlayer?.id,
      winnerPlayerId: this.winner?.id,
      loserPlayerId: this.loser?.id,
      players,
      nextGameId: this.nextGameId,
    };
  }

  addPlayer(player: Player) {
    if (this.status !== GameStatus.NOT_STARTED) {
      throw new Error('Game has started already, cannot add player.');
    }
    if (this.players.length >= 6) {
      throw new Error('Too many players.');
    }
    this.players.push(player);
    player.joinGame(this);
    this.dealCards(player);
  }

  start() {
    if (this.status !== GameStatus.NOT_STARTED) {
      // the game has started already; ignore the start attempt
      return;
    }

    if (this.players.length < 2) {
      throw new Error('Cannot start game with less than 2 players.');
    }

    this.status = GameStatus.WAITING_FOR_ATTACK;

    // make a circular list of players
    for (let idx = 0; idx < this.players.length; ++idx) {
      this.players[idx].setNextPlayer(
        this.players[(idx + 1) % this.players.length]
      );
    }

    this.attackingPlayer = findFirstPlayer(this.players, this.trump);
    this.defendingPlayer = this.nextPlayer(this.attackingPlayer!);
  }

  attack(player: Player, card: Card) {
    if (this.status !== GameStatus.WAITING_FOR_ATTACK) {
      throw new Error(`Cannot attack now, the game status is ${this.status}.`);
    }
    if (this.attackingPlayer!.id !== player.id) {
      throw new Error(
        `Expected attack from ${this.attackingPlayer!.id} ${
          this.attackingPlayer!.name
        }, but instead ${player.id} ${player.name} attacked.`
      );
    }

    if (this.defendingPlayer!.count() < 1) {
      throw new Error(
        `Defending player ${player.id} ${player.name} has no cards.`
      );
    }

    this.attackingPlayer!.remove(card);
    this.attackingCards = [card];
    this.defendingCards = [undefined];
    this.drawCardsOrder = [player];
    this.passedPlayers = [];
    this.status = GameStatus.WAITING_FOR_DEFENCE;
  }

  defend(player: Player, attackingCard: Card, defendingCard: Card) {
    if (
      this.status !== GameStatus.WAITING_FOR_DEFENCE &&
      this.status !== GameStatus.WAITING_FOR_MORE
    ) {
      throw new Error(`Cannot defend now, the game status is ${this.status}`);
    }

    if (this.defendingPlayer!.id !== player.id) {
      throw new Error(
        `Expected defence from ${this.defendingPlayer!.id} ${
          this.defendingPlayer!.name
        }, but instead ${player.id} ${player.name} defends.`
      );
    }

    let attackingCardIdx = undefined;
    for (let cardIdx = 0; cardIdx < this.attackingCards.length; ++cardIdx) {
      if (
        this.attackingCards[cardIdx].rank === attackingCard.rank &&
        this.attackingCards[cardIdx].suite === attackingCard.suite
      ) {
        attackingCardIdx = cardIdx;
      }
    }

    if (typeof attackingCardIdx === 'undefined') {
      throw new Error(
        `Card ${JSON.stringify(
          attackingCard
        )} is not one of the attacking cards.`
      );
    }

    if (this.defendingCards[attackingCardIdx]) {
      throw new Error(
        `Card ${JSON.stringify(
          attackingCard
        )} is already beaten by ${JSON.stringify(
          this.defendingCards[attackingCardIdx]
        )}.`
      );
    }

    if (!beats(defendingCard, attackingCard, this.trump)) {
      throw new Error(
        `Card ${JSON.stringify(
          defendingCard
        )} does not beat card ${JSON.stringify(
          attackingCard
        )} with trump suite ${this.trump}`
      );
    }

    this.defendingPlayer!.remove(defendingCard);
    this.defendingCards[attackingCardIdx] = defendingCard;
    this.passedPlayers = [];
    this.status = GameStatus.WAITING_FOR_MORE;
  }

  addCard(player: Player, card: Card) {
    if (
      this.status !== GameStatus.WAITING_FOR_DEFENCE &&
      this.status !== GameStatus.WAITING_FOR_MORE &&
      this.status !== GameStatus.WAITING_FOR_MORE_TO_TAKE
    ) {
      throw new Error(
        `Cannot add cards now, the game status is ${this.status}.`
      );
    }

    if (player.id === this.defendingPlayer!.id) {
      throw new Error(
        `Cannot add cards to themselves (player ${player.id} ${player.name} is defending).`
      );
    }

    if (
      this.attackingCards.length -
        this.defendingCards.filter(c => typeof c !== 'undefined').length >=
      this.defendingPlayer!.count()
    ) {
      throw new Error(
        `Cannot add more cards since player ${this.defendingPlayer!.id} ${
          this.defendingPlayer!.name
        } only has ${this.defendingPlayer!.count()} cards.`
      );
    }

    if (this.attackingCards.length >= 6) {
      throw new Error(
        'Cannot add more cards since there can only be 6 cards in one attack.'
      );
    }

    let sameRankFound = false;
    for (const cardOnTable of [
      ...this.attackingCards,
      ...this.defendingCards,
    ]) {
      if (typeof cardOnTable === 'undefined') {
        continue;
      }
      if (cardOnTable.rank === card.rank) {
        sameRankFound = true;
        break;
      }
    }
    if (!sameRankFound) {
      throw new Error(
        `Cannot add card ${JSON.stringify(card)} to the cards on the table.`
      );
    }

    player.remove(card);
    this.attackingCards.push(card);
    this.defendingCards.push(undefined);
    if (!this.drawCardsOrder.find(p => p.id === player.id)) {
      this.drawCardsOrder.push(player);
    }
    if (this.status !== GameStatus.WAITING_FOR_MORE_TO_TAKE) {
      this.passedPlayers = [];
    }

    if (
      this.status === GameStatus.WAITING_FOR_MORE_TO_TAKE &&
      this.attackingCards.length >=
        this.defendingPlayer!.count() +
          this.defendingCards.filter(c => typeof c !== 'undefined').length
    ) {
      // nobody can add any more cards and the defending player is picking the cards
      this.endOfTheMove();
    }
  }

  private endOfTheMove() {
    if (this.status === GameStatus.WAITING_FOR_MORE_TO_TAKE) {
      // the defending player takes all the cards
      for (const cardOnTable of [
        ...this.attackingCards,
        ...this.defendingCards,
      ]) {
        if (typeof cardOnTable === 'undefined') {
          continue;
        }
        this.defendingPlayer!.take(cardOnTable);
      }
    }

    // deal more card to players in the correct order
    for (const player of [...this.drawCardsOrder, this.defendingPlayer!]) {
      this.dealCards(player);
      if (player.count() === 0) {
        if (!this.winner) {
          this.winner = player;
        }
        this.emptyHands.push(player);
      }
    }

    // is the game over?
    if (this.emptyHands.length === this.players.length - 1) {
      // one player lost
      this.loser = this.players.find(p => p.count() > 0);
      this.status = GameStatus.FINISHED;
      return;
    }
    if (this.emptyHands.length === this.players.length) {
      // nobody has lost
      this.status = GameStatus.FINISHED;
      return;
    }

    this.attackingCards = [];
    this.defendingCards = [];

    // who attacks next?
    this.attackingPlayer =
      this.status === GameStatus.WAITING_FOR_MORE_TO_TAKE
        ? this.nextPlayer(this.defendingPlayer!)
        : this.nextPlayer(this.attackingPlayer!);
    this.defendingPlayer = this.nextPlayer(this.attackingPlayer);
    this.status = GameStatus.WAITING_FOR_ATTACK;
  }

  pass(player: Player) {
    if (
      this.status !== GameStatus.WAITING_FOR_MORE &&
      this.status !== GameStatus.WAITING_FOR_MORE_TO_TAKE
    ) {
      throw new Error(`Cannot pass now, the game status is ${this.status}.`);
    }

    if (this.defendingPlayer!.id === player.id) {
      throw new Error(
        `The defending player ${player.id} ${player.name} cannot pass.`
      );
    }

    if (this.passedPlayers.find(p => p.id === player.id)) {
      return;
    }

    if (player.cards.length > 0) {
      this.passedPlayers.push(player);
    }

    if (
      this.passedPlayers.length ===
      this.players.filter(
        p => p.id !== this.defendingPlayer!.id && p.count() > 0
      ).length
    ) {
      // all players with cards in hands passed other than the defending player
      this.endOfTheMove();
    }
  }

  pickUp(player: Player) {
    if (
      this.status !== GameStatus.WAITING_FOR_DEFENCE &&
      this.status !== GameStatus.WAITING_FOR_MORE
    ) {
      throw new Error(`Cannot take now, the game status is ${this.status}.`);
    }

    if (this.defendingPlayer!.id !== player.id) {
      throw new Error(
        `Expected defence from ${this.defendingPlayer!.id} ${
          this.defendingPlayer!.name
        }, but instead ${player.id} ${player.name} wants to take cards.`
      );
    }

    this.status = GameStatus.WAITING_FOR_MORE_TO_TAKE;

    if (
      this.attackingCards.length >=
      this.defendingPlayer!.count() +
        this.defendingCards.filter(c => typeof c !== 'undefined').length
    ) {
      // the defending player cannot take any more cards
      this.endOfTheMove();
    }
  }
}
