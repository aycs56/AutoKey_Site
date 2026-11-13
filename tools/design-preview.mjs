import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveVideoFile } from './hosting/server.mjs';

// Local design review only. This server cannot expose the repository root.
const project = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const steamPreview = process.argv.includes('--steam');
const recommendationsPreview = process.argv.includes('--recommendations');
const designName = recommendationsPreview ? 'recommendations-v1' : steamPreview ? 'steam-download-v1' : 'redesign-v1';
const designRoot = await realpath(path.join(project, 'docs/ai-team/design', designName));
const publicRoot = await realpath(path.join(project, 'public'));
const aliases = new Map([
  ['/i18n-core.js', 'i18n-core.js'], ['/i18n.js', 'i18n.js'],
  ['/assets/autokey.svg', 'assets/autokey.svg'], ['/assets/autokey.ico', 'assets/autokey.ico']
]);
if (steamPreview || recommendationsPreview) {
  aliases.set('/app.js', 'app.js');
  aliases.set('/assets/mining-scene.svg', 'assets/mining-scene.svg');
}
if (recommendationsPreview) {
  for (const file of ['assets/autokey-steam-header.jpg', 'assets/autokey-video-poster.jpg', 'media/autokey-introduction.mp4']) aliases.set('/' + file, file);
}
const port = Number(process.env.PORT || (recommendationsPreview ? 4192 : steamPreview ? 4189 : 4187));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const url = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const alias = aliases.get(url);
    const root = alias ? publicRoot : designRoot;
    const candidate = alias ? path.join(root, alias) : path.resolve(root, '.' + (url.endsWith('/') ? url + 'review.html' : url));
    const resolved = await realpath(candidate);
    if (!resolved.startsWith(root + path.sep) || !(await stat(resolved)).isFile()) { response.writeHead(403).end(); return; }
    if (path.extname(resolved) === '.mp4') {
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('X-Robots-Tag', 'noindex, nofollow');
      await serveVideoFile(request, response, resolved); return;
    }
    const body = await readFile(resolved);
    response.writeHead(200, {
      'Content-Type': types[path.extname(resolved)] || 'application/octet-stream',
      'Content-Length': body.length, 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) { response.writeHead(error instanceof URIError ? 400 : 404).end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`AutoKey ${designName}: http://127.0.0.1:${port}/`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
