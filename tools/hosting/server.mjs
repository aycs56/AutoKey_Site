import http from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const required = ['index.html', 'styles.css', 'app.js', 'i18n-core.js', 'i18n.js', 'locales.js', 'assets/autokey.svg'];
export async function createSiteServer({ root, siteUrl }) {
  const directory = await realpath(path.resolve(root));
  const within = file => file === directory || file.startsWith(`${directory}${path.sep}`);
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'");
    const send = (status, type, body, cache = 'no-store') => {
      res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body), 'Cache-Control': cache });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return send(405, 'text/plain', 'Method not allowed'); }
      const raw = req.url.split('?')[0];
      let name;
      try { name = decodeURIComponent(raw); } catch { return send(400, 'text/plain', 'Invalid path'); }
      if (!name.startsWith('/') || name.startsWith('//') || /[\\:\x00-\x1f\x7f]/.test(name) || name.split('/').some(part => part.startsWith('.'))) return send(404, 'text/plain', 'Not found');
      if (name === '/healthz') {
        const checks = await Promise.all(required.map(async file => {
          try {
            const resolved = await realpath(path.join(directory, file));
            const info = await stat(resolved);
            return within(resolved) && info.isFile() && info.size > 0;
          } catch { return false; }
        }));
        const ok = checks.every(Boolean);
        return send(ok ? 200 : 503, 'application/json; charset=utf-8', JSON.stringify({ ok, service: 'autokey-site', pid: process.pid, siteUrl }));
      }
      let file = path.resolve(directory, `.${name}`);
      if (!within(file)) return send(404, 'text/plain', 'Not found');
      if ((await stat(file)).isDirectory()) {
        if (!name.endsWith('/')) {
          // Keep Location relative to this origin, without trusting the Host header.
          const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
          res.writeHead(308, { Location: `${raw}/${query}`, 'Cache-Control': 'no-cache' }); return res.end();
        }
        file = path.join(file, 'index.html');
      }
      file = await realpath(file);
      if (!within(file)) return send(404, 'text/plain', 'Not found');
      const extension = path.extname(file).toLowerCase();
      if (!types[extension]) return send(404, 'text/plain', 'Not found');
      const content = await readFile(file);
      send(200, types[extension], content, ['.html', '.json', '.xml'].includes(extension) ? 'no-cache' : 'public, max-age=300');
    } catch (error) {
      if (['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) {
        const content = await readFile(path.join(directory, '404.html')).catch(() => 'Not found');
        send(404, 'text/html; charset=utf-8', content);
      } else {
        console.error('Request failed:', error.code || error.name);
        send(500, 'text/plain', 'Temporarily unavailable');
      }
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--config');
  if (index < 0 || !process.argv[index + 1]) throw new Error('Use --config <absolute config.json>');
  const config = JSON.parse((await readFile(process.argv[index + 1], 'utf8')).replace(/^\uFEFF/, ''));
  if (!Number.isInteger(config.port) || config.port < 1024 || config.port > 65535) throw new Error('Invalid port');
  const server = await createSiteServer(config);
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.on('error', error => { console.error(error.code || error.message); process.exitCode = 1; });
  server.listen(config.port, '127.0.0.1', () => console.log(`AutoKey origin listening on 127.0.0.1:${config.port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
