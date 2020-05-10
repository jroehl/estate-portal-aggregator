import estates from './estates.json';
import estatesRecursive from './estates-recursive.json';
import estate from './estate.json';
import attachment from './attachment.json';

export default async (uri: string, options: any) => {
  if (uri.includes('immobilienscout24')) {
    expect(options.headers.Authorization).toBeDefined();
    expect(options.headers['Cache-Control']).toBe('no-cache');
    expect(options.headers.Accept).toBe('application/json');

    if (uri.includes('error')) throw new Error('Request error');
    if (uri.includes('pagesize=2')) return estatesRecursive;
    if (uri.includes('realestate?')) return estates;

    if (uri.includes('attachment')) return attachment;

    const id = estate['realestates.apartmentBuy']['@id'];
    if (uri.includes(id)) return estate;
    return { type: 'error', statusCode: 404, message: 'NotFound' };
  }
};
