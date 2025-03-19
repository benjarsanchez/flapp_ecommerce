import https from 'https';

export const insecureAgent = new https.Agent({
  rejectUnauthorized: false
});