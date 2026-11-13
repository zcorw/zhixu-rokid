import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const files = new Map([['/', 'preview/index.html'], ['/app.js','preview/app.js'], ['/report.js','aiui/lib/report.js'], ['/demo.js','aiui/lib/demo.js']]);
createServer(async (req,res) => {
  const file = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!file) {res.writeHead(404); return res.end();}
  try {res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8'); res.end(await readFile(new URL('../'+file, import.meta.url)));} catch {res.writeHead(500);res.end();}
}).listen(4173, '127.0.0.1');
