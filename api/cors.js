// api/cors.js
import Cors from 'cors';

const cors = Cors({
  origin: 'https://tattoo-consent.vercel.app',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default cors;
