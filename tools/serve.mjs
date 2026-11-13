import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { contentRoot } from './content-root.mjs';
import { serveVideoFile, siteContentSecurityPolicy } from './hosting/server.mjs';

const projectRoot = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const root = await contentRoot(projectRoot, process.argv.includes('--dist') ? 'dist' : 'public');
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const candidate = path.resolve(root, `.${relative}`);
    if (!candidate.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    const resolved = await realpath(candidate);
    if (!resolved.startsWith(root + path.sep) || !(await stat(resolved)).isFile()) {
      response.writeHead(403).end(); return;
    }
    if (path.extname(resolved) === '.mp4') {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      await serveVideoFile(request, response, resolved); return;
    }
    const body = await readFile(resolved);
    response.writeHead(200, {
      'Content-Type': types[path.extname(resolved)] || 'application/octet-stream',
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': siteContentSecurityPolicy
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const badRequest = error instanceof URIError;
    response.writeHead(badRequest ? 400 : 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(badRequest ? 'Bad request' : 'Not found');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`AutoKey Site: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
