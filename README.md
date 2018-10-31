# Cat vs. Dogs

This project was generated with the [Dojo CLI](https://github.com/dojo/cli) & [Dojo CLI create app command](https://github.com/dojo/cli-create-app).

This app is a demo for a fun and not serious conference talk about JavaScript and tech debates and memes (e.g. tabs vs. spaces, classes vs. not), with the ultimate debate being whether we prefer cats or dogs.

It will first be presented at the [November 2018 Phoenix TypeScript meetup](https://www.meetup.com/Phoenix-TypeScript/events/255940576/) and then at [HalfStack 2018](http://halfstackconf.com/). Slides and video links to be provided once they're available, as well as a link to the running application.

The Cats vs. Dogs app leverages modern [Dojo](https://dojo.io/), Web Animation, WebAudio, and more for this simple demo app.

## Build

Clone the repository and then run `npm install`.

Then run `dojo build --mode dist` (the `mode` option defaults to `dist`) to create a production build for the project. The built artifacts will be stored in the `output/dist` directory.

## Development Build

Run `dojo build --mode dev` to create a development build for the project. The built artifacts will be stored in the `output/dev` directory.

## Development server

Run `dojo build --mode dev --watch memory --serve` to create an in memory development build and start a development server with hot reload. By default the server runs on port `9999`, navigate to `http://localhost:9999/`.

To change the port of the development use the `--port` option.

## Running unit tests

To run units tests in node only use `dojo test` which uses JIT (just in time) compilation.

To run the unit tests against built bundles, first the run a test build with `dojo build --mode unit`. The build test artifacts are written to the `output/tests/unit` directory.

Then `dojo test -c local` to run the projects unit tests. These tests are located in the `tests/unit` directory. The `--watch` options can be used with the test build which means that `dojo test` can be re-run without needing to re-build the full application each time.

## Running functional tests

To run the functional tests, first the run a test build with `dojo build --mode functional` and then `dojo test -f` to run the projects functional tests. These tests are located in the `tests/functional` directory.

## Further help

To get help for these commands and more, run `dojo` on the command line.
