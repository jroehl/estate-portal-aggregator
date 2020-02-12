import { Argv } from 'yargs';

export const command = 'immobilienscout24';

export const aliases = ['is24'];

const usage = `
$0 ${command} <cmd> [args]

> Pass credentials as flags:
$0 ${command} <cmd> --consumer-key <consumer-key> --consumer-secret <consumer-secret> --oauth-token <oauth-token> --oauth-token-secret <oauth-token-secret>

> Pass credentials as env variables:
export IS24_CONSUMER_KEY="<consumer-key>" 
export IS24_CONSUMER_SECRET="<consumer-secret>"
export IS24_OAUTH_TOKEN="<oauth-token>"
export IS24_OAUTH_TOKEN_SECRET="<oauth-token-secret>"
`;

export interface Immobilienscout24Flags {
  consumerKey?: string;
  consumerSecret?: string;
  oauthToken?: string;
  oauthTokenSecret?: string;
}

exports.builder = (yargs: Argv) =>
  yargs
    .usage(usage)
    .env('IS24')
    .commandDir(`${command}_commands`)
    .demandCommand(1, 'Please specify a subcommand.')
    .group(
      ['consumer-key', 'consumer-secret', 'oauth-token', 'oauth-token-secret'],
      'Credentials:'
    )
    .options({
      'consumer-key': {
        type: 'string',
        alias: ['ck'],
        required: true,
      },
      'consumer-secret': {
        type: 'string',
        alias: ['cs'],
        required: true,
      },
      'oauth-token': {
        type: 'string',
        alias: ['ot'],
        required: true,
      },
      'oauth-token-secret': {
        type: 'string',
        alias: ['os'],
        required: true,
      },
    });
