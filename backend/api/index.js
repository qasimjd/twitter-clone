import app from '../index.js'; 
import { createServer } from 'http';

const server = createServer(app);

export default function handler(req, res) {
  server.emit('request', req, res);
}
