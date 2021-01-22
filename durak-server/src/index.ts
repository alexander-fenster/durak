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

import * as express from 'express';
import {players} from './player';
import {games} from './game';
import {
  newGame,
  joinGame,
  start,
  getTable,
  attack,
  addCard,
  defend,
  pass,
  pickUp,
  nextGame,
} from './server';
import {cleanupTimeout, port} from './constants';

const subscribers: {[key: string]: express.Response} = {};

function updateSubscribers(gameId?: number) {
  if (typeof gameId === 'undefined' || !games[gameId]) {
    return;
  }
  const playerKeys = games[gameId].getPlayerKeys();
  for (const playerKey of playerKeys) {
    const subscriber = subscribers[playerKey];
    const player = players[playerKey];
    if (subscriber && player) {
      subscribers[playerKey].json(player.getTable());
      delete subscribers[playerKey];
    }
  }
}

const app = express();
app.param('playerKey', (req, _res, next, playerKey) => {
  const player = players[playerKey];
  if (typeof player === 'undefined') {
    next(new Error(`Player ${playerKey} was not found.`));
  }
  req.player = player;
  next();
});

app.param('attackingCard', (req, _res, next, attackingCard) => {
  req.attackingCard = attackingCard;
  next();
});

app.param('defendingCard', (req, _res, next, defendingCard) => {
  req.defendingCard = defendingCard;
  next();
});

app.post('/durak/v1/player/:playerName/newGame', (req, res) => {
  const playerName = req.params.playerName;
  const response = newGame(playerName);
  console.log(
    `new game request from ${playerName}, game ${response.gameId} created`
  );
  res.json(response);
});

app.post('/durak/v1/player/:playerName/joinGame/:gameId', (req, res) => {
  const playerName = req.params.playerName;
  const gameId = req.params.gameId;
  if (!gameId.match(/^\d{1,4}$/)) {
    throw new Error('Game ID must be a 4 digit number.');
  }
  const response = joinGame(playerName, Number(gameId));
  console.log(`request from ${playerName} to join game ${gameId}`);
  res.json(response);
  updateSubscribers(Number(gameId));
});

app.post('/durak/v1/playerKey/:playerKey/nextGame', (req, res) => {
  const player = req.player!;
  const response = nextGame(player);
  console.log(
    `request from ${player.name} to have one more game ${response.gameId}`
  );
  res.json(response);
  updateSubscribers(player.getGameId());
});

app.post('/durak/v1/playerKey/:playerKey/start', (req, res) => {
  const player = req.player!;
  const response = start(player);
  console.log(`game ${response.gameId} started`);
  res.json(response);
  updateSubscribers(player.getGameId());
});

app.post('/durak/v1/playerKey/:playerKey/getTable', (req, res) => {
  const player = req.player!;
  const response = getTable(player);
  res.json(response);
});

app.post('/durak/v1/playerKey/:playerKey/attack/:attackingCard', (req, res) => {
  const player = req.player!;
  const attackingCard = req.attackingCard!;
  const response = attack(player, attackingCard);
  res.json(response);
  updateSubscribers(player.getGameId());
});

app.post(
  '/durak/v1/playerKey/:playerKey/addCard/:attackingCard',
  (req, res) => {
    const player = req.player!;
    const attackingCard = req.attackingCard!;
    const response = addCard(player, attackingCard);
    res.json(response);
    updateSubscribers(player.getGameId());
  }
);

app.post(
  '/durak/v1/playerKey/:playerKey/defend/:attackingCard/:defendingCard',
  (req, res) => {
    const player = req.player!;
    const attackingCard = req.attackingCard!;
    const defendingCard = req.defendingCard!;
    const response = defend(player, attackingCard, defendingCard);
    res.json(response);
    updateSubscribers(player.getGameId());
  }
);

app.post('/durak/v1/playerKey/:playerKey/pass', (req, res) => {
  const player = req.player!;
  const response = pass(player);
  res.json(response);
  updateSubscribers(player.getGameId());
});

app.post('/durak/v1/playerKey/:playerKey/pickUp', (req, res) => {
  const player = req.player!;
  const response = pickUp(player);
  res.json(response);
  updateSubscribers(player.getGameId());
});

// Long polling subscribe
app.get('/durak/v1/subscribe/:playerKey', (req, res) => {
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  if (!req.player) {
    throw new Error('Player not found.');
  }
  const key = req.player!.key;
  if (key in subscribers) {
    console.log(`ending old subscription from player ${key}`);
    subscribers[key].status(408).end(); // end with HTTP timeout
    delete subscribers[key];
  }
  subscribers[key] = res;
  req.on('close', () => {
    delete subscribers[key];
  });
  setTimeout(() => {
    if (key in subscribers) {
      console.log(`ending stale subscription from player ${key}`);
      subscribers[key].status(408).end(); // end with HTTP timeout
      delete subscribers[key];
    }
  }, cleanupTimeout);
});

app.listen(port);
