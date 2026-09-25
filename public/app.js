'use strict';

(() => {
  const t = (source, values) => window.AutoKeyI18n.t(source, values);
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];
  const tablist = document.querySelector('.scenario-tabs');
  const simulators = [...document.querySelectorAll('[data-simulator]')];
  let active = 'work';
  let running = false;
  let looping = false;
  let count = 0;
  let generation = 0;
  const timers = new Set();

  const simulator = () => document.querySelector(`[data-simulator="${active}"]`);
  const schedule = (callback, delay) => {
    const currentGeneration = generation;
    const id = window.setTimeout(() => {
      timers.delete(id);
      if (currentGeneration === generation && running) callback();
    }, delay);
    timers.add(id);
  };

  function clearSchedule() {
    generation += 1;
    timers.forEach(id => window.clearTimeout(id));
    timers.clear();
  }

  function updateControls(message) {
    const target = simulator();
    if (!target) return;
    const status = target.querySelector('.demo-status');
    status.textContent = t(message);
    status.classList.toggle('is-running', running);
    target.querySelector('.once-button').disabled = running;
    const loopButton = target.querySelector('.loop-button');
    loopButton.textContent = t(running ? '停止示範' : '開始循環') + (running ? ' ■' : ' ↻');
    loopButton.setAttribute('aria-label', t(running ? '停止示範' : '開始循環'));
  }

  function releaseKeys() {
    simulators.forEach(target => {
      target.querySelector('.demo-key').classList.remove('is-pressed');
      const meter = target.querySelector('.hold-meter');
      if (meter) meter.classList.remove('is-holding');
    });
  }

  function stop(message = '示範已停止') {
    clearSchedule();
    running = false;
    looping = false;
    releaseKeys();
    const target = simulator();
    if (target && active === 'game') target.querySelector('.hold-label').textContent = t('已釋放');
    updateControls(message);
  }

  function resetView() {
    count = 0;
    simulators.forEach(target => {
      target.querySelector('.demo-count').textContent = t('{count} 次', { count: 0 });
      target.querySelectorAll('.rhythm-track span').forEach(dot => dot.classList.remove('is-lit'));
      target.querySelector('.once-button').disabled = false;
      const button = target.querySelector('.loop-button');
      button.textContent = t('開始循環') + ' ↻';
      button.setAttribute('aria-label', t('開始循環'));
      const status = target.querySelector('.demo-status');
      status.textContent = t('尚未開始 · 網頁示意');
      status.classList.remove('is-running');
    });
    const work = document.querySelector('[data-simulator="work"]');
    work.querySelectorAll('.reading-list li').forEach((line, index) => line.classList.toggle('is-current', index === 0));
    work.querySelector('.reading-page').textContent = '01 / 04';
    const game = document.querySelector('[data-simulator="game"]');
    game.querySelector('.hold-meter').classList.remove('is-holding', 'is-complete');
    game.querySelector('.hold-label').textContent = t('等待開始');
  }

  function registerPress(target) {
    count += 1;
    target.querySelector('.demo-count').textContent = t('{count} 次', { count });
    target.querySelectorAll('.rhythm-track span').forEach((dot, index) => dot.classList.toggle('is-lit', index < Math.min(count, 4)));
  }

  function pressWork() {
    const target = simulator();
    target.querySelector('.demo-key').classList.add('is-pressed');
    registerPress(target);
    const position = count % 4;
    target.querySelectorAll('.reading-list li').forEach((line, index) => line.classList.toggle('is-current', index === position));
    target.querySelector('.reading-page').textContent = `0${position + 1} / 04`;
    schedule(() => {
      target.querySelector('.demo-key').classList.remove('is-pressed');
      if (!looping) stop('已完成一次示範');
    }, 200);
    if (looping) schedule(pressWork, 2000);
  }

  function pressGame() {
    const target = simulator();
    const meter = target.querySelector('.hold-meter');
    target.querySelector('.demo-key').classList.add('is-pressed');
    meter.classList.remove('is-complete');
    meter.classList.add('is-holding');
    target.querySelector('.hold-label').textContent = t('長壓中');
    schedule(() => {
      target.querySelector('.demo-key').classList.remove('is-pressed');
      meter.classList.remove('is-holding');
      meter.classList.add('is-complete');
      registerPress(target);
      if (looping) {
        target.querySelector('.hold-label').textContent = t('休息 1 秒');
        schedule(pressGame, 1000);
      } else stop('已完成一次示範');
    }, 1000);
  }

  function start(loop) {
    if (running || active === 'fight' || document.hidden) return;
    clearSchedule();
    resetView();
    running = true;
    looping = loop;
    updateControls(loop ? '循環示範中 · 按停止即可結束' : '單次執行中 · 可隨時停止');
    if (active === 'work') pressWork();
    if (active === 'game') pressGame();
  }

  function selectTab(name, focus = false) {
    stop();
    active = name;
    resetView();
    tabs.forEach(tab => {
      const selected = tab.dataset.tab === name;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== name; });
  }

  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${tab.dataset.tab}`);
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next].dataset.tab, true);
    });
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
  });
  simulators.forEach(target => {
    target.querySelector('.demo-controls').hidden = false;
    target.querySelector('.once-button').addEventListener('click', () => start(false));
    target.querySelector('.loop-button').addEventListener('click', () => running ? stop() : start(true));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running) stop('分頁離開時已停止，按開始重新示範');
  });
  window.addEventListener('pagehide', () => stop('示範已停止'));
  window.addEventListener('autokey:language-change', () => {
    const wasRunning = running;
    stop();
    resetView();
    if (wasRunning) updateControls('語言已切換，示範已停止');
  });
  selectTab('work');
  document.documentElement.classList.add('js');
})();
