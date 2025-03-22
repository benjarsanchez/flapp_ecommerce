import ShortUrl from '../models/shortUrl.js';

export const createShortUrl = async (originalUrl) => {
  return await ShortUrl.create({ originalUrl });
};

export const getShortUrlByCode = async (code) => {
  return await ShortUrl.findOne({ where: { shortCode: code } });
};

export const incrementClickCount = async (code) => {
  const url = await getShortUrlByCode(code);
  return await url.increment('clicks');
};