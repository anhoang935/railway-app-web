import app from '../index.js'; // export your app without listen()

export default function handler(req, res) {
  return app(req, res); // delegate to Express
}