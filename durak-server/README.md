# durak-ui

API server for [Durak](https://en.wikipedia.org/wiki/Durak) card game.

## Running locally

```
$ npm install
$ npm run compile
$ npm start
```

By default it will listen on port 3000 and will work with the default
setup of the [UI](../durak-ui).

For deploying to [App Engine](https://cloud.google.com/appengine),
use the included `app.yaml`. Make sure you compile the TypeScript code
before deploying (the `build` folder must exist).

## Author

Alexander Fenster, fenster@fenster.name,
[@alexander-fenster](https://github.com/alexander-fenster)

## Disclaimer

This is not an officially supported Google product.
