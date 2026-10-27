const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const host = '127.0.0.1';
const port = Number(process.env.PORT) || 8000;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.webm': 'video/webm',
};

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, `http://${host}`).pathname);
  } catch {
    response.writeHead(400);
    response.end('Bad request');
    return;
  }

  if (pathname === '/') {
    response.writeHead(302, { Location: '/road.html' });
    response.end();
    return;
  }

  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      response.writeHead(statError && statError.code === 'ENOENT' ? 404 : 403);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Length': stats.size,
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', (error) => {
      console.error(`Could not read ${filePath}:`, error);
      if (!response.headersSent) response.writeHead(500);
      response.end('Internal server error');
    });
    stream.pipe(response);
  });
});

server.listen(port, host, () => {
  console.log(`Codebeats Road: http://${host}:${port}/road.html`);
  console.log(`Dreamy: http://${host}:${port}/index.html`);
});

server.on('error', (error) => {
  console.error('Could not start the local server:', error);
  process.exitCode = 1;
});
