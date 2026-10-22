'use strict';

(() => {
  if (!window.AutoKeyI18n) return; // Static Traditional Chinese remains usable.
  const t = (source, values) => window.AutoKeyI18n.t(source, values);
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const simulators = [...document.querySelectorAll('[data-simulator]')];
  const hero = document.querySelector('.hero-visual');
  const heroScene = document.getElementById('hero-scene');
  const heroButton = document.getElementById('hero-play');
  const heroLabel = heroButton.querySelector('.hero-play-label');
  const heroStatus = document.getElementById('hero-status');
  const timers = new Set();
  let generation = 0;
  let active = 'game';
  let run = null;
  let count = 0;
  let heroPlayed = false;
  let scrollFrame = 0;

  const current = () => document.querySelector(`[data-simulator="${active}"]`);
  function later(callback, delay) {
    const scheduledGeneration = generation;
    const id = setTimeout(() => {
      timers.delete(id);
      if (scheduledGeneration === generation && run) callback();
    }, delay);
    timers.add(id);
  }
  function clearPlayback() {
    generation++;
    timers.forEach(clearTimeout);
    timers.clear();
    document.querySelectorAll('.stage.is-down').forEach(node => node.classList.remove('is-down'));
    document.querySelectorAll('.demo-key.is-pressed').forEach(node => node.classList.remove('is-pressed'));
    hero.classList.remove('is-playing');
  }
  function controls() {
    simulators.forEach(simulator => {
      const playing = run?.kind === 'demo' && simulator.dataset.simulator === active;
      simulator.querySelector('.once-button').disabled = playing;
      const loop = simulator.querySelector('.loop-button');
      loop.textContent = t(playing ? '停止示範' : '開始循環');
      loop.setAttribute('aria-label', t(playing ? '停止示範' : '開始循環'));
    });
    const heroRunning = run?.kind === 'hero';
    heroLabel.textContent = t(heroRunning ? '停止播放' : heroPlayed ? '重播示意' : '播放示意');
    heroButton.querySelector('.play-symbol').textContent = heroRunning ? '■' : heroPlayed ? '↻' : '▶';
    heroButton.setAttribute('aria-label', t(heroRunning ? '停止播放' : heroPlayed ? '重播示意' : '播放示意'));
  }
  function stop(message = '示範已停止') {
    const previous = run;
    clearPlayback();
    run = null;
    if (previous?.kind === 'hero') heroStatus.textContent = t(message);
    if (previous?.kind === 'demo') {
      const simulator = current();
      simulator.dataset.state = message === '已完成一次示範' ? 'completed' : 'stopped';
      simulator.querySelector('.demo-status').textContent = t(message);
      simulator.querySelector('.phase-label').textContent = t('已放開');
    }
    controls();
  }
  function resetPanels() {
    count = 0;
    simulators.forEach(simulator => {
      simulator.dataset.state = 'idle';
      simulator.querySelector('.demo-count').textContent = t('{count} 次', { count: 0 });
      simulator.querySelector('.demo-status').textContent = t('準備就緒');
      simulator.querySelector('.phase-label').textContent = t('等待開始');
    });
    document.querySelectorAll('.reading-list li').forEach((node, i) => node.classList.toggle('is-current', i === 0));
    document.querySelector('.reading-page').textContent = '01 / 04';
    controls();
  }
  function pressCycle() {
    const simulator = current();
    const stage = simulator.querySelector('.stage');
    const key = simulator.querySelector('.demo-key');
    count++;
    simulator.querySelector('.demo-count').textContent = t('{count} 次', { count });
    stage.classList.add('is-down');
    key.classList.add('is-pressed');
    simulator.querySelector('.phase-label').textContent = t(active === 'game' ? '長壓中' : '已按下');
    if (active === 'work') {
      const position = count % 4;
      simulator.querySelectorAll('.reading-list li').forEach((node, i) => node.classList.toggle('is-current', i === position));
      simulator.querySelector('.reading-page').textContent = `0${position + 1} / 04`;
    }
    const hold = active === 'game' ? 1000 : 100;
    const period = active === 'mouse' ? 500 : 2000;
    later(() => {
      stage.classList.remove('is-down');
      key.classList.remove('is-pressed');
      simulator.querySelector('.phase-label').textContent = t(run.loop ? '等待下一次' : '已放開');
      if (!run.loop) stop('已完成一次示範');
    }, hold);
    if (run.loop) later(pressCycle, period);
  }
  function startDemo(loop) {
    stop();
    resetPanels();
    run = { kind: 'demo', loop };
    current().dataset.state = 'running';
    current().querySelector('.demo-status').textContent = t(loop ? '循環示範中' : '執行中，可隨時停止');
    controls();
    pressCycle();
  }
  function startHero() {
    stop();
    heroPlayed = true;
    run = { kind: 'hero' };
    hero.classList.add('is-playing');
    heroStatus.textContent = t('示意播放中');
    controls();
    for (let cycle = 0; cycle < 3; cycle++) {
      const down = () => heroScene.classList.add('is-down');
      if (cycle === 0) down(); else later(down, cycle * 2000);
      later(() => heroScene.classList.remove('is-down'), cycle * 2000 + 1000);
    }
    later(() => stop('示意已播放完畢'), 6000);
  }
  function selectTab(name, moveFocus = false) {
    stop();
    active = name;
    tabs.forEach(tab => {
      const selected = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus({ preventScroll: true });
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
    resetPanels();
  }
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${tab.dataset.tab}`);
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      selectTab(tabs[next].dataset.tab, true);
    });
  });
  document.querySelector('.scenario-tabs').setAttribute('role', 'tablist');
  panels.forEach(panel => panel.setAttribute('role', 'tabpanel'));
  simulators.forEach(simulator => {
    simulator.querySelector('.demo-controls').hidden = false;
    simulator.querySelector('.once-button').addEventListener('click', () => startDemo(false));
    simulator.querySelector('.loop-button').addEventListener('click', () => run?.kind === 'demo' ? stop() : startDemo(true));
  });
  heroButton.hidden = false;
  heroButton.addEventListener('click', () => run?.kind === 'hero' ? stop() : startHero());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop('離開分頁時已停止，可重新開始');
  });
  window.addEventListener('pagehide', () => { stop(); cancelAnimationFrame(scrollFrame); });
  window.addEventListener('autokey:language-change', () => {
    const wasPlaying = Boolean(run);
    stop('切換語言後已停止示範');
    resetPanels();
    if (wasPlaying) {
      current().querySelector('.demo-status').textContent = t('切換語言後已停止示範');
      heroStatus.textContent = t('切換語言後已停止示範');
    } else heroStatus.textContent = t('按住 1 秒，放開後等 1 秒。');
    controls();
  });
  document.body.classList.add('is-enhanced');
  selectTab(active);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(node => observer.observe(node));
  }
  function updateProgress() {
    scrollFrame = 0;
    const distance = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--scroll', distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0);
  }
  window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress); }, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();
