import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { createSiteServer } from '../tools/hosting/server.mjs';

async function fixture(t) {
  const scratch = path.resolve('output/hosting-tests');
  await mkdir(scratch, { recursive: true });
  const root = await mkdtemp(path.join(scratch, 'origin-'));
  await mkdir(path.join(root, 'assets'));
  for (const file of ['index.html', 'styles.css', 'app.js', 'i18n-core.js', 'i18n.js', 'locales.js', 'assets/autokey.svg']) {
    await writeFile(path.join(root, file), file === 'index.html' ? '<h1>AutoKey</h1>' : 'fixture');
  }
  const server = await createSiteServer({ root, siteUrl: 'https://autokey.desktoppetstudio.com/' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    assert.ok(root.startsWith(scratch + path.sep));
    await rm(root, { recursive: true, force: true });
  });
  const request = (url, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path: url, method }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject); req.end();
  });
  return { root, request };
}

test('published page and scripts are served with correct types and security headers', async t => {
  const { request } = await fixture(t);
  const page = await request('/');
  assert.equal(page.status, 200);
  assert.equal(page.body, '<h1>AutoKey</h1>');
  assert.match(page.headers['content-security-policy'], /frame-ancestors 'none'/);
  assert.match((await request('/styles.css')).headers['content-type'], /text\/css/);
  assert.match((await request('/locales.js')).headers['content-type'], /javascript/);
});

test('health fails when published content is missing or empty', async t => {
  const { root, request } = await fixture(t);
  const healthy = await request('/healthz');
  assert.equal(healthy.status, 200);
  assert.deepEqual(JSON.parse(healthy.body), { ok: true, service: 'autokey-site', pid: process.pid, siteUrl: 'https://autokey.desktoppetstudio.com/' });
  await writeFile(path.join(root, 'locales.js'), '');
  assert.equal((await request('/healthz')).status, 503);
  await rm(path.join(root, 'index.html'));
  assert.equal(JSON.parse((await request('/healthz')).body).ok, false);
});

test('HEAD is bodyless, missing routes are 404 and writes are rejected', async t => {
  const { request } = await fixture(t);
  const head = await request('/', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.ok(Number(head.headers['content-length']) > 0);
  assert.equal((await request('/missing')).status, 404);
  assert.equal((await request('/', 'POST')).status, 405);
  assert.equal((await request('/healthz', 'HEAD')).body, '');
});

test('traversal, private dot paths and Windows alternate streams are not served', async t => {
  const { request } = await fixture(t);
  for (const target of ['/../package.json', '/%2e%2e/package.json', '/assets%5c..%5cpackage.json', '/styles.css::$DATA', '/.git/config', '/%00', '/%GG', '//example.com/']) {
    const response = await request(target);
    assert.ok([400, 403, 404].includes(response.status), `${target}: ${response.status}`);
    assert.ok(!response.body.includes('devDependencies'));
  }
});
