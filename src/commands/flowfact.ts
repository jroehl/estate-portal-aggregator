import { Argv } from 'yargs';

export const command = 'flowfact';

export const aliases = ['ff'];

const usage = `
$0 ${command} <cmd> [args]

> Pass credentials as flags:
API version 2
$0 ${command} <cmd> --token <token>
API version 1
$0 ${command} <cmd> --api-v1 --password <password> --customer <customer> --user <user>

> Pass credentials as env variables:
API version 2
export FLOWFACT_TOKEN="<token>"

API version 1
export FLOWFACT_API_V1="true" 
export FLOWFACT_PASSWORD="<password>"
export FLOWFACT_CUSTOMER="<customer>"
export FLOWFACT_USER="<user>"
`;

export interface FlowFactFlags {
  apiV1?: boolean;
  token?: string;
  password?: string;
  user?: string;
  customer?: string;
}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .env('FLOWFACT')
    .commandDir(`${command}_commands`)
    .demandCommand(1, 'Please specify a subcommand.')
    .group(['token'], 'API Version 2 (default):')
    .options({
      token: {
        type: 'string',
        alias: ['t', 'password', 'p'],
        required: true,
        description: 'Token for v2 or password for v1',
      },
    })
    .group(['api-v1', 'user', 'customer', 'password'], 'API Version 1:')
    .implies('api-v1', ['user', 'customer', 'password'])
    .options({
      'api-v1': {
        type: 'boolean',
        alias: ['v1'],
        description: 'Enable use of the v1 API',
      },
      user: {
        type: 'string',
        alias: ['u'],
      },
      customer: {
        type: 'string',
        alias: ['c'],
      },
    });
