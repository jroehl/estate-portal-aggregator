interface BasicAuthHeader {
  Authorization: string;
}

interface CognitoTokenHeader {
  cognitoToken: string;
}

export type AuthorizationHeader = BasicAuthHeader | CognitoTokenHeader;

export interface OAuth {
  consumerKey: string;
  consumerSecret: string;
  oauthToken: string;
  oauthTokenSecret: string;
}

export interface BasicAuth {
  customer: string;
  user: string;
  password: string;
}

export interface TokenAuth {
  token: string;
}

export type Credentials = OAuth | BasicAuth | TokenAuth;

export abstract class Authorization {
  protected credentials: Credentials;
  protected abstract authorizationHeader?: AuthorizationHeader;

  constructor(credentials: Credentials) {
    this.credentials = this.checkCredentials(credentials);
  }

  abstract checkCredentials(credentials: Credentials): Credentials;
  abstract async authorize(
    url?: string,
    method?: string
  ): Promise<AuthorizationHeader>;
}
