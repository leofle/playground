const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const CARDS_FILE = path.join(__dirname, 'cards.json');
const INDEX_FILE = path.join(__dirname, 'index.html');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // API: GET /api/cards
  if (method === 'GET' && url === '/api/cards') {
    try {
      const data = fs.readFileSync(CARDS_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  // API: POST /api/cards
  if (method === 'POST' && url === '/api/cards') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body); // validate JSON
        fs.writeFileSync(CARDS_FILE, body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end('{"error":"invalid JSON"}');
      }
    });
    return;
  }

  // Static files
  let filePath = url === '/' ? INDEX_FILE : path.join(__dirname, url);
  // Prevent path traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end(); return;
  }
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Kanban server running at http://localhost:${PORT}`);
});
