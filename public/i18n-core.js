'use strict';

(() => {
  const supported = Object.freeze(['en', 'zh-Hant', 'zh-Hans']);
  function matchLanguage(value) {
    if (typeof value !== 'string') return null;
    const parts = value.toLowerCase().replaceAll('_', '-').split('-');
    if (parts[0] === 'en') return 'en';
    if (parts[0] !== 'zh') return null;
    if (parts.includes('hant')) return 'zh-Hant';
    if (parts.includes('hans')) return 'zh-Hans';
    return parts.some(part => ['tw', 'hk', 'mo'].includes(part)) ? 'zh-Hant' : 'zh-Hans';
  }
  function resolveLocale(preference, languages) {
    if (supported.includes(preference)) return preference;
    for (const language of Array.isArray(languages) ? languages : []) {
      const match = matchLanguage(language);
      if (match) return match;
    }
    return 'en';
  }
  function translate(catalogs, locale, source, values = {}) {
    const catalog = catalogs[locale];
    const english = catalogs.en;
    const text = catalog && Object.hasOwn(catalog, source) ? catalog[source]
      : english && Object.hasOwn(english, source) ? english[source] : source;
    return text.replace(/\{([a-z]+)\}/g, (token, key) => Object.hasOwn(values, key) ? String(values[key]) : token);
  }
  globalThis.AutoKeyLocale = Object.freeze({ supported, matchLanguage, resolveLocale, translate });
})();
