import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
try { await access(new URL('public/i18n-core.js', root)); }
catch { throw new Error('Language resolution module is missing'); }
await import(new URL('public/i18n-core.js', root));
const { matchLanguage, resolveLocale, translate } = globalThis.AutoKeyLocale;
let passed = 0;
function check(actual, expected, label) { assert.deepEqual(actual, expected, label); passed++; console.log('PASS ' + label); }
for (const [input, expected] of [
  ['en-US', 'en'], ['EN-gb', 'en'], ['zh-TW', 'zh-Hant'], ['zh-HK', 'zh-Hant'], ['zh-MO', 'zh-Hant'],
  ['zh-Hant-CN', 'zh-Hant'], ['zh-Hans-TW', 'zh-Hans'], ['zh-CN', 'zh-Hans'], ['zh-SG', 'zh-Hans'],
  ['zh', 'zh-Hans'], ['zh_HK', 'zh-Hant'], ['ja-JP', null], [null, null]
]) check(matchLanguage(input), expected, 'Language tag ' + input);
check(resolveLocale('zh-Hant', ['en-US']), 'zh-Hant', 'Explicit supported choice has priority');
check(resolveLocale('invalid', ['fr-FR', 'zh-CN', 'en-US']), 'zh-Hans', 'Invalid preference falls through to ordered browser languages');
check(resolveLocale(null, ['fr-FR', 'ja-JP']), 'en', 'Unsupported browser languages fall back to English');
check(resolveLocale(null, []), 'en', 'Empty language list falls back to English');
check(resolveLocale(null, ['en-AU', 'zh-Hant']), 'en', 'First supported browser language wins');
check(resolveLocale('__proto__', ['zh-MO']), 'zh-Hant', 'Object property names are not supported preferences');

const catalogs = {};
for (const code of ['en', 'zh-Hant', 'zh-Hans']) catalogs[code] = JSON.parse(await readFile(new URL(`locales/${code}.json`, root), 'utf8'));
const keys = Object.keys(catalogs['zh-Hant']).sort();
const placeholders = text => (text.match(/\{[a-z]+\}/g) || []).sort();
for (const code of Object.keys(catalogs)) {
  check(Object.keys(catalogs[code]).sort(), keys, code + ' covers every source message');
  for (const key of keys) {
    assert.equal(typeof catalogs[code][key], 'string');
    assert.ok(catalogs[code][key].trim(), code + ' missing ' + key);
    assert.deepEqual(placeholders(catalogs[code][key]), placeholders(key), code + ' placeholder mismatch: ' + key);
  }
  passed++; console.log('PASS ' + code + ' messages have valid content and placeholders');
}
check(translate(catalogs, 'zh-Hant', '{count} 次', { count: 3 }), '3 次', 'Count interpolation follows the selected catalog');
check(translate({ en: { key: 'English fallback' } }, 'zh-Hans', 'key'), 'English fallback', 'Missing translation falls back to English');
check(translate({}, 'en', 'Unknown source'), 'Unknown source', 'Unknown message preserves source');
const template = await readFile(new URL('public/index.html', root), 'utf8');
const sources = [...template.matchAll(/>([^<>]+)</g)].map(m => m[1].trim());
sources.push(...[...template.matchAll(/(?:aria-label|alt|title|content)="([^"]+)"/g)].map(m => m[1].trim()));
for (const source of sources.filter(text => /[\u3400-\u9fff]/.test(text))) {
  if (['文', '繁體中文', '简体中文'].includes(source)) continue;
  assert.ok(Object.hasOwn(catalogs['zh-Hant'], source), 'Uncataloged visible source: ' + source);
}
passed++; console.log('PASS all static text and accessible metadata have catalog entries');
console.log(`Localization: ${passed} checks passed; ${keys.length} messages per language`);
