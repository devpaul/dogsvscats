# Cat vs. Dogs

This project was generated with the [Dojo CLI] & [Dojo CLI create app command](https://github.com/dojo/cli-create-app).

This app is a demo for a fun and not serious conference talk about JavaScript and tech debates and memes (e.g. tabs vs. spaces, classes vs. not), with the ultimate debate being whether we prefer cats or dogs.

It will first be presented at the [November 2018 Phoenix TypeScript meetup](https://www.meetup.com/Phoenix-TypeScript/events/255940576/) and then at [HalfStack 2018](https://halfstackconf.com/). Slides and video links to be provided once they're available, as well as a link to the running application.

The Cats vs. Dogs app leverages modern [Dojo], Web Animation, WebAudio, and more for this simple demo app.

## Overview

This repository contains both the client and server for cats vs dogs located in their respective directories. The root directory of this project provides scripts applicable to the entire project.

### Quick Start

* run `npm install` to install all dependencies
* to build the client run `npm run build`
* to start the server run `npm run start`

### Deploy

CatsvsDogs can be deployed to [Now] using `npm run deploy:now`. You will need to have an account and be logged in using the now CLI.

The client can also be deployed to Github pages using `npm run deploy:gh`

## Client

The client, located under the `client` directory, is built using [Dojo CLI].

### Build

Then run `dojo build --mode dist` (the `mode` option defaults to `dist`) to create a production build for the project. The built artifacts will be stored in the `output/dist` directory.

### Development Build

Run `dojo build --mode dev` to create a development build for the project. The built artifacts will be stored in the `output/dev` directory.

### Development server

Run `dojo build --mode dev --watch memory --serve` to create an in memory development build and start a development server with hot reload. By default the server runs on port `9999`, navigate to `http://localhost:9999/`.

To change the port of the development use the `--port` option.

### Further help

To get help for these commands and more, run `dojo` on the command line.

## Server

The server is located under the `server` directory and uses [NestJS] to provide APIs to the client.

### Starting

The server uses `ts-node` and does not require a build to start. Use `npm run start` to start the server.

## Acknowledgements

* Cat & Dog created by [Terdpongvector](https://www.freepik.com/terdpongvector)
* [Meow sound](https://freesound.org/people/tuberatanka/sounds/110011/) created by Tuberatanka
* [Bark sound](https://www.soundsnap.com/audio/mp3/248977/Large%20Dog%20Bark%203.mp3) by Soundsnap

[Dojo]: https://dojo.io/
[Dojo CLI]: https://github.com/dojo/cli
[NestJS]: https://nestjs.com
[Now]: (https://zeit.co/now)
