import { scrape } from './scrape.js';

export async function handler(event, context) {
  console.log('Scheduled scrape triggered');
  return await scrape(event, context);
}
