import OAuth from 'oauth-1.0a';

import { Portal, FetchOptions } from '../Portal';
import {
  Authorization,
  AuthorizationHeader,
  Credentials,
  OAuth as IOAuth,
} from '../../Authorization';

import { createHmac } from 'crypto';
import { get } from 'lodash';

export {
  Immobilienscout24EstateCommon,
  Immobilienscout24EstateDetailed,
} from './Estate';

class Immobilienscout24Authorization extends Authorization {
  protected authorizationHeader?: AuthorizationHeader;
  async authorize(url: string, method: string): Promise<AuthorizationHeader> {
    const { consumerKey, consumerSecret, oauthToken, oauthTokenSecret } = this
      .credentials as IOAuth;

    const oauth = new OAuth({
      consumer: {
        key: consumerKey,
        secret: consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString: string, key: string) {
        return createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      },
    });

    const header = oauth.toHeader(
      oauth.authorize(
        { url, method },
        {
          key: oauthToken,
          secret: oauthTokenSecret,
        }
      )
    );

    return header as AuthorizationHeader;
  }

  checkCredentials(credentials: Credentials): Credentials {
    const oAuth = (credentials as unknown) as IOAuth;
    const isValid = Boolean(
      oAuth.consumerKey &&
        oAuth.consumerSecret &&
        oAuth.oauthToken &&
        oAuth.oauthTokenSecret
    );

    if (!isValid) {
      throw 'Credential validation for Immobilienscout24 failed - missing property';
    }
    return credentials;
  }
}

export class Immobilienscout24 extends Portal {
  baseURL: string =
    'https://rest.immobilienscout24.de/restapi/api/offer/v1.0/user/me/realestate';

  constructor(credentials: IOAuth) {
    super(new Immobilienscout24Authorization(credentials));
  }

  private async _fetchEstates(
    options?: FetchOptions,
    elements: any[] = []
  ): Promise<any[]> {
    const currentPage = options?.page || 1;
    const size = options?.pageSize || 50;
    const uri = `${this.baseURL}?pagesize=${size}&pagenumber=${currentPage}`;

    const res = await this.request(uri);

    const {
      Paging: { numberOfHits },
      realEstateList: { realEstateElement },
    } = res['realestates.realEstates'];

    elements = [...elements, ...realEstateElement];
    if (options?.recursively && elements.length < numberOfHits) {
      return this._fetchEstates(
        { ...options, page: currentPage + 1 },
        elements
      );
    }

    return elements;
  }

  async fetchEstates(options?: FetchOptions): Promise<any[]> {
    const results = await this._fetchEstates(options);
    if (!options?.detailed) return results;
    return Promise.all(
      results.map(async (res: any) => {
        const estateID = res['@id'];
        return this.fetchEstate(estateID);
      })
    );
  }

  async fetchEstate(id: string): Promise<any> {
    const uri = `${this.baseURL}/${id}`;
    const res = await this.request(uri);
    const [type] = Object.keys(res);
    const attachments = await this.getAttachments(
      get(res[type], 'attachments[0]["@xlink.href"]', '')
    );
    return { type, ...res[type], attachments };
  }

  private async getAttachments(uri: string): Promise<any[]> {
    if (!uri) return [];
    const res = await this.request(uri);
    return get(res, '["common.attachments"][0].attachment', []);
  }
}
