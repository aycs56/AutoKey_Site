import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createSiteServer } from '../tools/hosting/server.mjs';

test('MP4 playback supports complete, partial, suffix and invalid requests', async t => {
  const output = path.resolve('output');
  await mkdir(output, { recursive: true });
  const root = await mkdtemp(path.join(output, 'media-test-'));
  const bytes = Buffer.from('0123456789abcdef');
  await writeFile(path.join(root, 'clip.mp4'), bytes);
  const server = await createSiteServer({ root, siteUrl: 'http://localhost' });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    assert.ok(root.startsWith(output + path.sep) && path.basename(root).startsWith('media-test-'));
    await rm(root, { recursive: true });
  });
  const url = `http://127.0.0.1:${server.address().port}/clip.mp4`;
  await t.test('GET is video/mp4 with byte-range support', async () => {
    const r = await fetch(url);
    assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'video/mp4');
    assert.equal(r.headers.get('accept-ranges'), 'bytes'); assert.equal(await r.text(), bytes.toString());
  });
  for (const [range, expected, contentRange] of [['bytes=2-5','2345','bytes 2-5/16'],['bytes=12-','cdef','bytes 12-15/16'],['bytes=-3','def','bytes 13-15/16'],['bytes=14-99','ef','bytes 14-15/16']]) {
    await t.test(range, async () => {
      const r = await fetch(url, { headers: { Range: range } });
      assert.equal(r.status, 206); assert.equal(r.headers.get('content-range'), contentRange);
      assert.equal(Number(r.headers.get('content-length')), expected.length); assert.equal(await r.text(), expected);
    });
  }
  await t.test('HEAD has headers without body', async () => {
    const r = await fetch(url, { method:'HEAD' });
    assert.equal(r.status, 200); assert.equal(r.headers.get('content-length'), '16'); assert.equal(await r.text(), '');
  });
  for (const range of ['bytes=99-','bytes=6-2','bytes=-0','bytes=x-y','bytes=0-1,4-5']) {
    await t.test(`reject ${range}`, async () => {
      const r = await fetch(url, { headers: { Range:range } });
      assert.equal(r.status, 416); assert.equal(r.headers.get('content-range'), 'bytes */16'); await r.arrayBuffer();
    });
  }
  await t.test('If-Range without a matching validator falls back to the full file', async () => {
    const r = await fetch(url, { headers:{ Range:'bytes=2-5', 'If-Range':'"old-version"' } });
    assert.equal(r.status, 200); assert.equal(await r.text(), bytes.toString());
  });
});
