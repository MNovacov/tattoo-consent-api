import Cors from "cors";

const cors = Cors({
  methods: ["POST", "OPTIONS"],
  origin: "https://tattoo-consent.vercel.app", 
  optionsSuccessStatus: 200,
});

export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default cors;
