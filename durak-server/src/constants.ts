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

export enum Suite {
  CLUBS = '♣',
  DIAMONDS = '♦',
  HEARTS = '♥',
  SPADES = '♠',
}

export enum Rank {
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export const suites = [Suite.CLUBS, Suite.DIAMONDS, Suite.HEARTS, Suite.SPADES];
export const ranks = [
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
  Rank.ACE,
];

export interface Card {
  suite: Suite;
  rank: Rank;
}

export const cardsInHand = 6;

export const cleanupTimeout = 60 * 60 * 1000; // 1 hour

export const port = process.env.PORT || 3000;
