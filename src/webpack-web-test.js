/* istanbul ignore next */
import 'linoleum/src/sandbox';

// require all modules ending in "_test" from the
// current directory and all subdirectories
/* istanbul ignore next */
let testsContext = require.context('project/test/', true, /^\.\/(?!.*\.server\.js$).*\.js$/);
/* istanbul ignore next */
testsContext.keys().forEach(testsContext);
