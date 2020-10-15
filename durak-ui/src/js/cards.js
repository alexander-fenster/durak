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

const cardToUnicode = {
  '♠': {
    '6': '&#x1F0A6',
    '7': '&#x1F0A7',
    '8': '&#x1F0A8',
    '9': '&#x1F0A9',
   '10': '&#x1F0AA',
    'J': '&#x1F0AB',
    'Q': '&#x1F0AD',
    'K': '&#x1F0AE',
    'A': '&#x1F0A1',
  },
  '♥': {
    '6': '&#x1F0B6',
    '7': '&#x1F0B7',
    '8': '&#x1F0B8',
    '9': '&#x1F0B9',
   '10': '&#x1F0BA',
    'J': '&#x1F0BB',
    'Q': '&#x1F0BD',
    'K': '&#x1F0BE',
    'A': '&#x1F0B1',
  },
  '♦': {
    '6': '&#x1F0C6',
    '7': '&#x1F0C7',
    '8': '&#x1F0C8',
    '9': '&#x1F0C9',
   '10': '&#x1F0CA',
    'J': '&#x1F0CB',
    'Q': '&#x1F0CD',
    'K': '&#x1F0CE',
    'A': '&#x1F0C1',
  },
  '♣': {
    '6': '&#x1F0D6',
    '7': '&#x1F0D7',
    '8': '&#x1F0D8',
    '9': '&#x1F0D9',
   '10': '&#x1F0DA',
    'J': '&#x1F0DB',
    'Q': '&#x1F0DD',
    'K': '&#x1F0DE',
    'A': '&#x1F0D1',
  }
}

const color = {
  '♠': 'black',
  '♥': 'red',
  '♦': 'red',
  '♣': 'black',
}

function unicode(rank, suite) {
  if (!rank || !suite) {
    return '&#x1F0A0';
  }
  return cardToUnicode[suite][rank];
}

class Card {
  constructor(card) {
    if (!card) {
      this.rank = null;
      this.suite = null;
    } else {
      this.rank = card.rank;
      this.suite = card.suite;
    }
    this.unicode = unicode(this.rank, this.suite);
    this.color = this.suite ? color[this.suite] : '#0000b3';
  }

  span(properties) {
    properties = Object.assign({}, properties);
    if (!properties['class']) {
      properties['class'] = '';
    }
    properties['class'] = `card ${this.color} ` + properties['class'];
    properties['class'] = properties['class'].trim();
    properties['data-rank'] = this.rank || '';
    properties['data-suite'] = this.suite || '';
    let htmlProperties = '';
    for (const property in properties) {
      htmlProperties += ` ${property}="${properties[property]}"`;
    }
    htmlProperties = htmlProperties.trim();
    return `<span ${htmlProperties}>${this.unicode}</span>`;
  }
}

export {Card};
