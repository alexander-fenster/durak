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

import {display} from './display';
import {gameReset} from './misc';
const maxErrorCount = 10;

function resubscribe(app, playerKey, timeout=1000) {
  setTimeout(() => { subscribe(app, playerKey); }, timeout);
}

async function subscribe(app, playerKey) {
  let errorCount = Number(localStorage.getItem('subscribeErrorCount')); // 0 if null

  try {
    const {data, status} = await app.$f7.request.promise.getJSON(`durak/v1/subscribe/${playerKey}`);

    if (status !== 200) {
      ++errorCount;
      localStorage.setItem('subscribeErrorCount', String(errorCount));
      if (errorCount < maxErrorCount) {
        resubscribe(app, playerKey);
      }
    } else {
      localStorage.setItem('gameData', JSON.stringify(data));
      display(app, data);
      localStorage.setItem('subscribeErrorCount', 0);
      if (data.status !== 'FINISHED') {
        resubscribe(app, playerKey, 0);
      }
    }
  } catch (err) {
    ++errorCount;
    localStorage.setItem('subscribeErrorCount', String(errorCount));
    if (errorCount < maxErrorCount) {
      resubscribe(app, playerKey);
    }
    return;
  }
}

function handleRefresh(app) {
  const $ptrContent = app.$$('.ptr-content');
  $ptrContent.on('ptr:refresh', async () => {
    const playerKey = localStorage.getItem('playerKey');
    if (playerKey) {
      const {data} = await app.$f7.request.promise.postJSON(`durak/v1/playerKey/${playerKey}/getTable`);
      localStorage.setItem('gameData', JSON.stringify(data));
      gameReset(data);
      display(app, data);

      // if the existing subscription failed, subscribe again on refresh
      let errorCount = Number(localStorage.getItem('subscribeErrorCount')); // 0 if null
      if (errorCount >= maxErrorCount) {
        localStorage.setItem('subscribeErrorCount', 0);
        subscribe(app, data.playerKey);
      }
    }
    app.$f7.ptr.done();
  });
}

export {subscribe, handleRefresh};
