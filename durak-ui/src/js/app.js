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

import Framework7, { Dom7 } from 'framework7/framework7.esm.bundle.js';
const $$ = Dom7;

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';

// Import Routes
import routes from './routes.js';

// Import main app component
import App from '../app.f7.html';

import {displayFromSavedData} from './display';
import {subscribe, handleRefresh} from './subscribe';

const app = new Framework7({
  root: '#app', // App root element
  component: App, // App main component

  name: 'Дурак', // App name
  id: 'name.fenster.durak',
  theme: 'auto', // Automatic theme detection

  // App routes
  routes: routes,
});

$$(document).on('page:init',  '.page[data-name="home"]', function (e) {
  const fakeContext = {
    $$,
    $f7: app,
  }
  const data = displayFromSavedData(fakeContext);
  if (data) {
    if (data.status !== 'FINISHED') {
      subscribe(fakeContext, data.playerKey);
    }
    handleRefresh(fakeContext, data);
  }
});
