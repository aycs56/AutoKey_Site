'use strict';

(() => {
  const menu = document.querySelector('.tools-menu');
  const trigger = menu.querySelector('summary');
  function closeMenu(returnFocus = false) {
    menu.open = false;
    if (returnFocus) trigger.focus();
  }
  document.addEventListener('pointerdown', event => {
    if (!menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target)) closeMenu();
  });

  const section = document.querySelector('.recommendations');
  const track = section.querySelector('.recommendations-track');
  const cards = [...track.querySelectorAll('.recommendation-card')];
  const controls = section.querySelector('.carousel-controls');
  const toggle = section.querySelector('.carousel-toggle');
  const position = section.querySelector('.carousel-position');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const t = (key, values) => window.AutoKeyI18n.t(key, values);
  let automatic = !reducedMotion.matches;
  let visible = false;
  let hovered = false;
  let timer;
  let scrollFrame;

  function stops() {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    return [...new Set(cards.map(card => Math.min(max, card.offsetLeft - cards[0].offsetLeft)))];
  }
  function currentIndex(points = stops()) {
    return points.reduce((best, value, index) => Math.abs(value - track.scrollLeft) < Math.abs(points[best] - track.scrollLeft) ? index : best, 0);
  }
  function render() {
    toggle.querySelector('span').textContent = t(automatic ? '暫停輪播' : '播放輪播');
    toggle.querySelector('[data-pause-symbol]').toggleAttribute('hidden', !automatic);
    toggle.querySelector('[data-play-symbol]').toggleAttribute('hidden', automatic);
    position.textContent = t('第 {index} 個，共 {total} 個', { index: currentIndex() + 1, total: cards.length });
    position.setAttribute('aria-live', automatic ? 'off' : 'polite');
    track.setAttribute('aria-label', t('推薦工具輪播'));
  }
  function schedule() {
    clearTimeout(timer);
    if (!automatic || !visible || document.hidden || hovered || section.contains(document.activeElement) || stops().length < 2) return;
    timer = setTimeout(() => {
      move(1);
      schedule();
    }, 6000);
  }
  function move(direction) {
    const points = stops();
    const index = (currentIndex(points) + direction + points.length) % points.length;
    track.scrollTo({ left: points[index], behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  function stopAutomatic() {
    automatic = false;
    render();
    schedule();
  }
  for (const [selector, direction] of [['[data-carousel-prev]', -1], ['[data-carousel-next]', 1]]) {
    section.querySelector(selector).addEventListener('click', () => {
      stopAutomatic();
      move(direction);
    });
  }
  toggle.addEventListener('click', () => {
    automatic = !automatic;
    render();
    schedule();
  });
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    stopAutomatic();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  track.addEventListener('pointerdown', stopAutomatic);
  track.addEventListener('wheel', stopAutomatic, { passive: true });
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(render);
  }, { passive: true });
  section.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    hovered = true;
    schedule();
  });
  section.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  section.addEventListener('focusin', schedule);
  section.addEventListener('focusout', () => requestAnimationFrame(schedule));
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pagehide', () => clearTimeout(timer));
  window.addEventListener('pageshow', () => { closeMenu(); schedule(); });
  window.addEventListener('resize', () => { render(); schedule(); });
  window.addEventListener('autokey:language-change', render);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopAutomatic(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
    schedule();
  }, { threshold: [0, 0.25] }).observe(section);
  controls.hidden = false;
  position.hidden = false;
  render();
})();
