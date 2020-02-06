// Import our DAO object
import * as yargs from 'yargs'; // We will take advantage of typings and intellsence.

export interface globalFlags {
  detailed: boolean;
  normalize: boolean;
  storeResult: boolean;
  pretty: boolean;
}

yargs
  .usage('$0 <cmd> [args]')
  .options({
    'store-result': {
      type: 'boolean',
      default: true,
      description: 'Store the results in a file',
    },
    normalize: {
      type: 'boolean',
      default: true,
      description: 'Return the normalized version of the estate',
    },
    detailed: {
      type: 'boolean',
      default: true,
      description: 'Return the long/detailed version of the estate',
    },
    pretty: {
      type: 'boolean',
      default: true,
      description: 'Store the estate pretty printed',
    },
  })
  .commandDir('commands')
  .demandCommand(1, 'Please specify a command.').argv;
