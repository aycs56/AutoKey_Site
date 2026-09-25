'use strict';

(() => {
  const { resolveLocale, translate } = window.AutoKeyLocale;
  const catalogs = window.AutoKeyMessages;
  const storageKey = 'autokey-site.language';
  const selector = document.getElementById('site-language');
  const notice = document.getElementById('language-notice');
  const bindings = [];
  let preference = null;
  try { preference = localStorage.getItem(storageKey); } catch { /* Preferences are optional. */ }
  let locale = resolveLocale(preference, navigator.languages?.length ? navigator.languages : [navigator.language]);
  let storageFailed = false;

  // Bind source text once; changing languages never replaces markup, controls,
  // focus, FAQ expansion or the selected scenario. All translations are text.
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest('script,style,noscript,[data-no-translate]')) continue;
    const source = node.textContent.trim();
    if (!Object.hasOwn(catalogs['zh-Hant'], source)) continue;
    const leading = node.textContent.match(/^\s*/)[0];
    const trailing = node.textContent.match(/\s*$/)[0];
    bindings.push(() => { node.textContent = leading + t(source) + trailing; });
  }
  document.querySelectorAll('[aria-label],[alt],[title],meta[name="description"]').forEach(element => {
    if (element.closest('[data-no-translate]')) return;
    for (const attribute of ['aria-label', 'alt', 'title', 'content']) {
      const source = element.getAttribute(attribute);
      if (source && Object.hasOwn(catalogs['zh-Hant'], source)) bindings.push(() => element.setAttribute(attribute, t(source)));
    }
  });
  function t(source, values) { return translate(catalogs, locale, source, values); }
  function render() {
    bindings.forEach(binding => binding());
    document.documentElement.lang = locale;
    selector.value = locale;
    notice.hidden = !storageFailed;
    notice.textContent = storageFailed ? t('此瀏覽器無法儲存語言偏好；目前選擇仍然有效。') : '';
  }
  window.AutoKeyI18n = Object.freeze({ t, get language() { return locale; } });
  selector.addEventListener('change', () => {
    const previous = locale;
    locale = resolveLocale(selector.value, []);
    try { localStorage.setItem(storageKey, locale); storageFailed = false; }
    catch { storageFailed = true; }
    render();
    if (previous !== locale) window.dispatchEvent(new Event('autokey:language-change'));
  });
  render();
  document.querySelector('.language-control').hidden = false;
})();
