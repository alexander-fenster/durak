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

import {describe, it} from 'mocha';
import * as assert from 'assert';

import {Player} from '../src/player';
import {Game, findFirstPlayer, GameStatus} from '../src/game';
import {Rank, Suite, ranks, suites} from '../src/constants';

describe('Game logic', () => {
  describe('Game class', () => {
    it('should construct new game', () => {
      const player = new Player(42, 'Test player');
      const game = new Game(player);
      const id = game.getGameId();
      assert(id.toString().match(/^\d+$/));
      assert(player.count() === 6);
    });

    it('should add a player', () => {
      const player = new Player(42, 'Test player');
      const game = new Game(player);
      const newPlayer = new Player(43, 'Another player');
      game.addPlayer(newPlayer);
      assert(newPlayer.count() === 6);
      const key = player.key;
      assert(
        key.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
        )
      );
    });

    it('should not add more than 6 players', () => {
      const players = [1, 2, 3, 4, 5, 6, 7].map(
        id => new Player(id, id.toString())
      );
      const game = new Game(players[0]);
      for (let idx = 1; idx < 6; ++idx) {
        game.addPlayer(players[idx]);
      }
      assert.throws(() => {
        game.addPlayer(players[6]);
      });
    });
  });

  describe('Who goes first?', () => {
    const player1 = new Player(1, '1', [
      {suite: Suite.SPADES, rank: Rank.JACK},
      {suite: Suite.HEARTS, rank: Rank.SIX},
    ]);
    const player2 = new Player(2, '2', [
      {suite: Suite.SPADES, rank: Rank.TEN},
      {suite: Suite.HEARTS, rank: Rank.SEVEN},
    ]);
    const player3 = new Player(3, '3', [
      {suite: Suite.DIAMONDS, rank: Rank.EIGHT},
      {suite: Suite.DIAMONDS, rank: Rank.ACE},
    ]);
    const players = [player1, player2, player3];

    it('finds the player with the lowest trump card 1', () => {
      const firstToMove = findFirstPlayer(players, Suite.SPADES);
      assert(firstToMove.id === 2);
    });

    it('finds the player with the lowest trump card 2', () => {
      const firstToMove = findFirstPlayer(players, Suite.HEARTS);
      assert(firstToMove.id === 1);
    });

    it('finds the player with the lowest trump card 3', () => {
      const firstToMove = findFirstPlayer(players, Suite.DIAMONDS);
      assert(firstToMove.id === 3);
    });

    it('finds the player with the lowest trump card 4 (no trumps at all)', () => {
      const firstToMove = findFirstPlayer(players, Suite.CLUBS);
      assert(firstToMove.id === 1);
    });
  });

  describe('Who goes first? regression test 1', () => {
    const player1 = new Player(1, '1', [
      {rank: Rank.TEN, suite: Suite.DIAMONDS},
      {rank: Rank.EIGHT, suite: Suite.CLUBS},
      {rank: Rank.NINE, suite: Suite.CLUBS},
      {rank: Rank.ACE, suite: Suite.CLUBS},
      {rank: Rank.ACE, suite: Suite.DIAMONDS},
      {rank: Rank.JACK, suite: Suite.DIAMONDS},
    ]);
    const player2 = new Player(2, '2', [
      {rank: Rank.SEVEN, suite: Suite.HEARTS},
      {rank: Rank.EIGHT, suite: Suite.SPADES},
      {rank: Rank.SEVEN, suite: Suite.CLUBS},
      {rank: Rank.SIX, suite: Suite.HEARTS},
      {rank: Rank.TEN, suite: Suite.SPADES},
      {rank: Rank.EIGHT, suite: Suite.DIAMONDS},
    ]);
    const player3 = new Player(3, '3', [
      {rank: Rank.NINE, suite: Suite.SPADES},
      {rank: Rank.EIGHT, suite: Suite.HEARTS},
      {rank: Rank.KING, suite: Suite.DIAMONDS},
      {rank: Rank.KING, suite: Suite.CLUBS},
      {rank: Rank.JACK, suite: Suite.SPADES},
      {rank: Rank.QUEEN, suite: Suite.CLUBS},
    ]);
    const players = [player1, player2, player3];

    it('finds the player who goes first 1', () => {
      const firstToMove = findFirstPlayer(players, Suite.SPADES);
      assert(firstToMove.id === 2);
    });

    it('finds the player who goes first 2', () => {
      const firstToMove = findFirstPlayer(players, Suite.DIAMONDS);
      assert(firstToMove.id === 2);
    });

    it('finds the player who goes first 3', () => {
      const firstToMove = findFirstPlayer(players, Suite.HEARTS);
      assert(firstToMove.id === 2);
    });

    it('finds the player who goes first 4', () => {
      const firstToMove = findFirstPlayer(players, Suite.CLUBS);
      assert(firstToMove.id === 2);
    });
  });

  describe('Who goes first? regression test 2', () => {
    const player1 = new Player(1, '1', [
      {rank: Rank.ACE, suite: Suite.HEARTS},
      {rank: Rank.SEVEN, suite: Suite.SPADES},
      {rank: Rank.JACK, suite: Suite.SPADES},
      {rank: Rank.QUEEN, suite: Suite.HEARTS},
      {rank: Rank.JACK, suite: Suite.CLUBS},
      {rank: Rank.SEVEN, suite: Suite.HEARTS},
    ]);
    const player2 = new Player(2, '2', [
      {rank: Rank.KING, suite: Suite.DIAMONDS},
      {rank: Rank.SIX, suite: Suite.CLUBS},
      {rank: Rank.EIGHT, suite: Suite.CLUBS},
      {rank: Rank.NINE, suite: Suite.DIAMONDS},
      {rank: Rank.SIX, suite: Suite.DIAMONDS},
      {rank: Rank.ACE, suite: Suite.SPADES},
    ]);
    const player3 = new Player(3, '3', [
      {rank: Rank.TEN, suite: Suite.SPADES},
      {rank: Rank.KING, suite: Suite.CLUBS},
      {rank: Rank.NINE, suite: Suite.CLUBS},
      {rank: Rank.EIGHT, suite: Suite.DIAMONDS},
      {rank: Rank.SEVEN, suite: Suite.CLUBS},
      {rank: Rank.SIX, suite: Suite.HEARTS},
    ]);
    const players = [player1, player2, player3];

    it('finds the player who goes first 1', () => {
      const firstToMove = findFirstPlayer(players, Suite.SPADES);
      assert(firstToMove.id === 1);
    });

    it('finds the player who goes first 2', () => {
      const firstToMove = findFirstPlayer(players, Suite.DIAMONDS);
      assert(firstToMove.id === 2);
    });

    it('finds the player who goes first 3', () => {
      const firstToMove = findFirstPlayer(players, Suite.HEARTS);
      assert(firstToMove.id === 3);
    });

    it('finds the player who goes first 4', () => {
      const firstToMove = findFirstPlayer(players, Suite.CLUBS);
      assert(firstToMove.id === 2);
    });
  });

  describe('Regular game', () => {
    const sixH = {rank: Rank.SIX, suite: Suite.HEARTS};
    const sixS = {rank: Rank.SIX, suite: Suite.SPADES};
    const queenC = {rank: Rank.QUEEN, suite: Suite.CLUBS};
    const jackD = {rank: Rank.JACK, suite: Suite.DIAMONDS};
    const sevenH = {rank: Rank.SEVEN, suite: Suite.HEARTS};
    const queenH = {rank: Rank.QUEEN, suite: Suite.HEARTS};
    const deck = [sixH, sixS, queenC, sevenH, jackD, queenH];

    it('the regular game works', () => {
      const player1 = new Player(1, 'player1');
      const player2 = new Player(2, 'player2');
      const game = new Game(player1, deck, 2); // deal just 2 cards to each player
      game.addPlayer(player2);

      // were cards dealt correctly?
      assert.deepEqual(player1.cards, [sixH, sixS]);
      assert.deepEqual(player2.cards, [queenC, sevenH]);
      assert.deepEqual(game.getTable().trumpCard, queenH);
      assert.strictEqual(game.getTable().trump, Suite.HEARTS);

      player1.start();
      assert.strictEqual(game.getTable().deckCount, 2);
      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_ATTACK);
      assert.strictEqual(game.getTable().attackingPlayerId, 1);
      assert.strictEqual(game.getTable().defendingPlayerId, 2);

      // first move
      assert.throws(() => {
        player2.attack(queenC);
      });
      assert.throws(() => {
        player1.attack(queenC);
      });
      player1.attack(sixS);
      assert.deepEqual(game.getTable().attackingCards, [sixS]);
      assert.deepEqual(game.getTable().defendingCards, [undefined]);
      assert.strictEqual(
        game.getTable().status,
        GameStatus.WAITING_FOR_DEFENCE
      );
      assert.throws(() => {
        player1.defend(sixH, sixS);
      });
      assert.throws(() => {
        player2.defend(sixS, sixH);
      });
      assert.throws(() => {
        player2.defend(sixH, sevenH);
      });
      assert.throws(() => {
        player2.defend(sixS, jackD);
      });
      player2.defend(sixS, sevenH);
      assert.deepEqual(game.getTable().attackingCards, [sixS]);
      assert.deepEqual(game.getTable().defendingCards, [sevenH]);
      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_MORE);
      player1.pass();
      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_ATTACK);
      assert.strictEqual(game.getTable().attackingPlayerId, 2);
      assert.strictEqual(game.getTable().defendingPlayerId, 1);
      assert.strictEqual(game.getTable().deckCount, 0);
      assert.deepEqual(player1.cards, [sixH, jackD]);
      assert.deepEqual(player2.cards, [queenC, queenH]);

      player2.attack(queenC);
      player1.defend(queenC, sixH);
      player2.addCard(queenH);
      assert.throws(() => {
        player2.pickUp();
      });
      player1.pickUp();

      assert.deepEqual(player1.cards, [jackD, queenC, queenH, sixH]);
      assert.deepEqual(player2.cards, []);
      assert.strictEqual(game.getTable().status, GameStatus.FINISHED);
      assert.strictEqual(game.getTable().winnerPlayerId, 2);
      assert.strictEqual(game.getTable().loserPlayerId, 1);
    });

    it('random game works', () => {
      // note: this is a slightly random test - the deck is random.
      // random tests are evil!
      // but the players will behave in a very predictable way so
      // we can validate the logic - e.g. that all cards were played.
      const player1 = new Player(1, 'player1');
      const player2 = new Player(2, 'player2');
      const game = new Game(player1); // deal just 2 cards to each player
      game.addPlayer(player2);

      // were cards dealt correctly?
      assert.deepEqual(player1.cards.length, 6);
      assert.deepEqual(player2.cards.length, 6);

      player1.start();
      const attackingPlayer =
        game.getTable().attackingPlayerId === 1 ? player1 : player2;
      const defendingPlayer =
        game.getTable().defendingPlayerId === 1 ? player1 : player2;
      while (game.getTable().status !== GameStatus.FINISHED) {
        attackingPlayer.attack(attackingPlayer.cards[0]);
        defendingPlayer.pickUp();
        attackingPlayer.pass();
      }

      assert.strictEqual(attackingPlayer.cards.length, 0);
      assert.strictEqual(defendingPlayer.cards.length, 36);
      for (const rank of ranks) {
        for (const suite of suites) {
          assert(
            defendingPlayer.cards.some(
              card => card.rank === rank && card.suite === suite
            )
          );
        }
      }
      assert.strictEqual(game.getTable().winnerPlayerId, attackingPlayer.id);
      assert.strictEqual(game.getTable().loserPlayerId, defendingPlayer.id);
    });
  });

  describe('Regular game - regression tests', () => {
    it('regression test 1', () => {
      const sixH = {rank: Rank.SIX, suite: Suite.HEARTS};
      const sixS = {rank: Rank.SIX, suite: Suite.SPADES};
      const queenC = {rank: Rank.QUEEN, suite: Suite.CLUBS};
      const jackD = {rank: Rank.JACK, suite: Suite.DIAMONDS};
      const sevenH = {rank: Rank.SEVEN, suite: Suite.HEARTS};
      const queenH = {rank: Rank.QUEEN, suite: Suite.HEARTS};
      const eightC = {rank: Rank.EIGHT, suite: Suite.CLUBS};
      const eightH = {rank: Rank.EIGHT, suite: Suite.HEARTS};
      const eightS = {rank: Rank.EIGHT, suite: Suite.SPADES};
      const deck = [
        sixH,
        sixS,
        queenC,
        sevenH,
        jackD,
        queenH,
        eightC,
        eightH,
        eightS,
      ];

      const player1 = new Player(1, 'player1');
      const player2 = new Player(2, 'player2');
      const player3 = new Player(3, 'player3');
      const game = new Game(player1, deck, 3);
      game.addPlayer(player2);
      game.addPlayer(player3);

      player1.start();
      player1.attack(sixH);
      player2.pickUp();
      player3.pass();
      player1.addCard(sixS);
      player1.pass();

      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_ATTACK);
    });

    it('regression test 2', () => {
      const sixH = {rank: Rank.SIX, suite: Suite.HEARTS};
      const sixS = {rank: Rank.SIX, suite: Suite.SPADES};
      const sixC = {rank: Rank.SIX, suite: Suite.CLUBS};
      const sixD = {rank: Rank.SIX, suite: Suite.DIAMONDS};
      const sevenH = {rank: Rank.SEVEN, suite: Suite.HEARTS};
      const sevenS = {rank: Rank.SEVEN, suite: Suite.SPADES};
      const sevenC = {rank: Rank.SEVEN, suite: Suite.CLUBS};
      const sevenD = {rank: Rank.SEVEN, suite: Suite.DIAMONDS};
      const eightH = {rank: Rank.EIGHT, suite: Suite.HEARTS};
      const eightS = {rank: Rank.EIGHT, suite: Suite.SPADES};
      const nineH = {rank: Rank.NINE, suite: Suite.HEARTS};
      const nineS = {rank: Rank.NINE, suite: Suite.SPADES};
      const queenC = {rank: Rank.QUEEN, suite: Suite.CLUBS};
      const queenS = {rank: Rank.QUEEN, suite: Suite.SPADES};
      const queenH = {rank: Rank.QUEEN, suite: Suite.HEARTS};
      const queenD = {rank: Rank.QUEEN, suite: Suite.DIAMONDS};
      const aceC = {rank: Rank.ACE, suite: Suite.CLUBS};
      const aceS = {rank: Rank.ACE, suite: Suite.SPADES};
      const aceH = {rank: Rank.ACE, suite: Suite.HEARTS};
      const aceD = {rank: Rank.ACE, suite: Suite.DIAMONDS};
      const deck = [
        sixH, // to be beaten by eightH
        sixS, //                 eightS
        sixC, //                 sevenC
        sixD, //                 sevenD
        sevenH, //               nineH
        sevenS, //               nineS
        eightH,
        eightS,
        sevenC,
        sevenD,
        nineH,
        nineS,
        queenC,
        queenS,
        queenH,
        queenD,
        aceC,
        aceS,
        aceH,
        aceD,
      ];

      const player1 = new Player(1, 'player1');
      const player2 = new Player(2, 'player2');
      const game = new Game(player1, deck, 6);
      game.addPlayer(player2);

      player1.start();
      player1.attack(sixH);
      player1.addCard(sixS);
      player1.addCard(sixC);
      player1.addCard(sixD);
      player2.defend(sixC, sevenC);
      player2.defend(sixD, sevenD);
      player1.addCard(sevenH);
      player1.addCard(sevenS);

      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_MORE);
      player2.defend(sixH, eightH);
      player2.defend(sixS, eightS);
      player2.defend(sevenH, nineH);
      player2.defend(sevenS, nineS);

      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_MORE);

      player1.pass();
      assert.strictEqual(game.getTable().status, GameStatus.WAITING_FOR_ATTACK);
    });
  });
});
