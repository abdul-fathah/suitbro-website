/**
 * Suit Bro — static file server.
 *
 * Zero dependencies: Node's built-in http/fs/path only. Nothing to npm install,
 * nothing to break on build. Serves everything in ./public.
 *
 * Railway (and most hosts) assign a port via process.env.PORT — we read it and
 * fall back to 3000 for local work.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
};

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath, status) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 500, 'Internal server error', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    // HTML changes often; hashed-free assets get a short cache. Keep it simple.
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=3600';
    send(res, status, data, { 'Content-Type': type, 'Cache-Control': cache });
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method not allowed', {
      'Content-Type': 'text/plain; charset=utf-8',
      Allow: 'GET, HEAD',
    });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    send(res, 400, 'Bad request', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  if (pathname === '/') pathname = '/index.html';

  // Resolve inside ROOT and reject anything that escapes it (../ traversal).
  const target = path.resolve(ROOT, '.' + pathname);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  fs.stat(target, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(res, target, 200);
      return;
    }

    // Allow extension-less URLs: /about serves public/about.html
    const withHtml = target + '.html';
    fs.stat(withHtml, (err2, stats2) => {
      if (!err2 && stats2.isFile()) {
        serveFile(res, withHtml, 200);
        return;
      }
      // Anything else falls back to the homepage.
      serveFile(res, path.join(ROOT, 'index.html'), 404);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Suit Bro running on http://localhost:${PORT}`);
});
