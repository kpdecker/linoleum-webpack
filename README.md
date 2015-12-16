# Linoleum-Webpack

Webpack build infrastructure for Linoleum projects.

## Usage

Within `Gulpfile.js`:

```
// Init global state
var Linoleum = require('@kpdecker/linoleum');

// Include optional linoleum tasks
require('@kpdecker/linoleum-webpack');
```

Global APIs:

- `CLIENT_ENTRY`: Path to the client build entry point
- `KARMA_TEST_FILES`: Glob representing karma test files. May be overridden. Will be ignored from mocha tests.
- `SERVER_PORT`: Port that the webpack dev server instance will proxy.
- `DEV_SERVER_PORT`: Port that the webpack dev server will be hosted on.

(Added to the `Linoleum` root project)

Defines:

- `webpack` task which generates webpack build packages.
  This includes:
  - `lib/$client$/`: Web client package
  - `lib/index.js`: Node server package
  - `lib/$cover$/`: Test coverage node package

  This is intended to replace the `babel` build tasks for projects using Webpack, not augment them.
- `webpack:dev-server` task which launches a webpack developer server instance
- `watch:karma` task which runs Karma tests in watch mode.
- `cover:server` task which runs webpack coverage tests in node.
- `cover:web` task which runs webpack coverage tests in browser.

For webpack tests, each package will filter the tests that are imported based on the file suffix. `.server.js` tests will only run under the `cover:server` task and `.web.js` tests will only run under the `cover:web` task. Simple `.js` files will run under both.

## Common issues
### Karma

Travis needs to be configured to use Firefox when running Karma tests. This can be done with the following config:

```
before_script:
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
  - sleep 3 # give xvfb some time to start
```

If a `Error: Path doesn't exist '/_karma_webpack_/karma-test.js'` or similar is seen when running Karma, this is due to the Karma tests directory not existing.
