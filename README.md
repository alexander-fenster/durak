# Durak card game

[Durak](https://en.wikipedia.org/wiki/Durak) is a card game with very
simple rules, very popular in Russia.

## Background

I wanted to be able to play Durak with my family when we're on a trip,
and, to my surprise, I wasn't able to find any online Durak game that
satisfied my requirements:
- it's free;
- it does not require registration or any kind of social media account;
- it works well on iPhones and iPads, but
- it does not require installing any application (works in browser);
- last but not least, you can play with your family and people you know,
  not some random strangers.

It's hard to imagine but I wasn't able to find such a service, so I had
no other option rather than implement my own :)

## Contents

1. [Server](durak-server/) (Node.js, express).
2. [UI](durak-ui/) (Node.js, [Framework7](https://framework7.io)).

To run it locally, you need to have a running server process and a web
server serving the UI HTML/JS/CSS files. Please look at the corresponding
READMEs for more information.

The code can be hosted on [App Engine](https://cloud.google.com/appengine),
all the needed configuration YAML files are included.

## Author

Alexander Fenster, fenster@fenster.name,
[@alexander-fenster](https://github.com/alexander-fenster)

## Disclaimer

This is not an officially supported Google product.

## Another disclaimer

I work for Google, hence this code has Google copyright on it.

I'm as far from any game development as you could imagine,
and I have never done any front-end job in my life, so
in no way this code may serve as an example of a front-end
development.
