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
// Which directory to serve. Defaults to public/ so the raw source can still be
// served directly; the environment builds set this to dist/<environment>.
const ROOT = path.resolve(__dirname, process.env.SERVE_DIR || 'public');

if (!fs.existsSync(ROOT)) {
  console.error(`Nothing to serve: ${ROOT} does not exist.`);
  console.error(`Run a build first, e.g.  node scripts/build.js development`);
  process.exit(1);
}

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
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogv': 'video/ogg',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
};

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(req, res, filePath, status) {
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      send(res, 500, 'Internal server error', { 'Content-Type': 'text/plain; charset=utf-8' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    // HTML changes often; other assets get a short cache. Keep it simple.
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=3600';

    function stream(opts, code, extraHeaders) {
      res.writeHead(code, Object.assign({
        'Content-Type': type,
        'Cache-Control': cache,
        'Accept-Ranges': 'bytes',
      }, extraHeaders));
      if (req.method === 'HEAD') { res.end(); return; }
      const rs = fs.createReadStream(filePath, opts);
      rs.on('error', () => res.destroy());
      res.on('close', () => rs.destroy());
      rs.pipe(res);
    }

    // A Range request is how a browser seeks within a video. Without this a
    // <video> element can only play straight through from the start, and the
    // whole file is buffered before it begins.
    const range = status === 200 && req.headers.range;
    const m = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (m && (m[1] !== '' || m[2] !== '')) {
      let start, end;
      if (m[1] === '') {                       // suffix form: last N bytes
        const n = parseInt(m[2], 10);
        start = Math.max(0, st.size - n);
        end = st.size - 1;
      } else {
        start = parseInt(m[1], 10);
        end = m[2] === '' ? st.size - 1 : parseInt(m[2], 10);
      }
      if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= st.size) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + st.size });
        res.end();
        return;
      }
      end = Math.min(end, st.size - 1);
      stream({ start: start, end: end }, 206, {
        'Content-Length': end - start + 1,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + st.size,
      });
      return;
    }

    stream({}, status, { 'Content-Length': st.size });
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
      serveFile(req, res, target, 200);
      return;
    }

    // Allow extension-less URLs: /about serves public/about.html
    const withHtml = target + '.html';
    fs.stat(withHtml, (err2, stats2) => {
      if (!err2 && stats2.isFile()) {
        serveFile(req, res, withHtml, 200);
        return;
      }
      // Anything else falls back to the homepage.
      serveFile(req, res, path.join(ROOT, 'index.html'), 404);
    });
  });
});

server.listen(PORT, () => {
  let env = 'public/ (raw source)';
  try {
    env = JSON.parse(fs.readFileSync(path.join(ROOT, 'build-info.json'), 'utf8')).environment;
  } catch (e) { /* serving raw source, no build-info present */ }
  console.log(`Suit Bro [${env}] running on http://localhost:${PORT}`);
  console.log(`  serving ${path.relative(__dirname, ROOT) || '.'}`);
});
