# durak-ui

UI for [Durak](https://en.wikipedia.org/wiki/Durak) card game.

## Running locally

Please make sure you have a [server](../durak-server/) running
before starting the UI. For local development or for playing within
the local network, you can just use the default settings (API server
listens on port 3000, web server listens on port 8080):

```
# make sure server is started and listens on 3000, then...

$ npm install
$ npm start
```

For deploying to [App Engine](https://cloud.google.com/appengine),
use the included `app.yaml` and `dispatch.yaml`. Before deploying,
make sure you build the distribution files:

```
$ npm run build-prod
```

## Author

Alexander Fenster, fenster@fenster.name,
[@alexander-fenster](https://github.com/alexander-fenster)

## Disclaimer

This is not an officially supported Google product.
