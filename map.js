import { PROJECTS, TIERS, NODES, EDGES, FLOWS } from './map-data.js';

// Carte interactive : les sites ouvrent leur page, les briques affichent leur fiche,
// les filtres allument un projet et les parcours font circuler un point lumineux le long des liens.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SVG = 'http://www.w3.org/2000/svg';
const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
const edgeKey = (a, b) => `${a}>${b}`;
const $ = id => document.getElementById(id);

const h = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...children.filter(c => c != null));
  return el;
};

const board = $('board'), svg = $('wires'), details = $('details');
const nodeEls = {}, edgeEls = {};
let selected = null, project = null, flowRun = 0;

// --- Briques ---

for (const [tier, label] of TIERS) {
  const row = h('div', { class: 'tier-row' });
  for (const n of NODES.filter(n => n.tier === tier)) {
    const body = [h('span', { class: 'node-name' }, n.name), h('span', { class: 'node-sub' }, n.sub)];
    let el;
    if (n.site && !n.here) {
      el = h('a', { class: `node node--site node--${n.accent}`, href: n.href }, ...body,
        h('span', { class: 'node-desc' }, n.role), h('span', { class: 'node-go', 'aria-hidden': 'true' }, 'Ouvrir →'));
    } else if (n.here) {
      el = h('div', { class: 'node node--site node--here', 'aria-current': 'page' }, ...body, h('span', { class: 'node-desc' }, n.role));
    } else {
      el = h('button', { type: 'button', class: 'node', 'aria-pressed': 'false', 'aria-controls': 'details' }, ...body);
      el.addEventListener('click', () => select(selected === n.id ? null : n.id));
    }
    el.dataset.id = n.id;
    el.addEventListener('mouseenter', () => preview(n.id));
    el.addEventListener('mouseleave', () => preview(null));
    el.addEventListener('focus', () => preview(n.id));
    el.addEventListener('blur', () => preview(null));
    nodeEls[n.id] = el;
    row.append(el);
  }
  board.append(h('section', { class: 'tier', 'aria-label': label }, h('h2', { class: 'tier-label' }, label), row));
}

// --- Liens : tracés en SVG d'après la position réelle des briques ---

for (const [from, to] of EDGES) {
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('class', 'wire');
  svg.append(path);
  edgeEls[edgeKey(from, to)] = path;
}

function layout() {
  const box = board.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const rect = id => {
    const r = nodeEls[id].getBoundingClientRect();
    return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height };
  };
  for (const [from, to] of EDGES) {
    const a = rect(from), b = rect(to);
    const ax = a.x + a.w / 2, bx = b.x + b.w / 2;
    let d;
    if (Math.abs(a.y - b.y) < 8) {
      // Même étage : une courbe qui passe sous les deux briques
      const y = Math.max(a.y + a.h, b.y + b.h), dip = 18 + Math.abs(ax - bx) * 0.12;
      d = `M${ax},${a.y + a.h} C${ax},${y + dip} ${bx},${y + dip} ${bx},${b.y + b.h}`;
    } else {
      const down = b.y > a.y;
      const y1 = down ? a.y + a.h : a.y, y2 = down ? b.y : b.y + b.h, mid = (y1 + y2) / 2;
      d = `M${ax},${y1} C${ax},${mid} ${bx},${mid} ${bx},${y2}`;
    }
    edgeEls[edgeKey(from, to)].setAttribute('d', d);
  }
}

new ResizeObserver(layout).observe(board);
document.fonts?.ready.then(layout);

// --- Mise en avant : une brique survolée, sélectionnée, un projet filtré ou un parcours ---

function highlight({ nodes = [], edges = [] } = {}, dimOthers = false) {
  board.classList.toggle('is-focused', dimOthers);
  for (const [id, el] of Object.entries(nodeEls)) el.classList.toggle('is-on', nodes.includes(id));
  for (const [key, el] of Object.entries(edgeEls)) el.classList.toggle('is-on', edges.includes(key));
}

const around = id => {
  const edges = EDGES.filter(([a, b]) => a === id || b === id);
  return { nodes: [id, ...edges.map(([a, b]) => (a === id ? b : a))], edges: edges.map(([a, b]) => edgeKey(a, b)) };
};
const ofProject = p => ({
  nodes: NODES.filter(n => n.projects.includes(p)).map(n => n.id),
  edges: EDGES.filter(e => e[3].includes(p)).map(([a, b]) => edgeKey(a, b)),
});

function restore() {
  if (selected) highlight(around(selected), true);
  else if (project) highlight(ofProject(project), true);
  else highlight();
}

function preview(id) {
  if (flowRun) return;
  if (id) highlight(around(id), true);
  else restore();
}

// --- Fiche d'une brique ---

const INTRO = details.innerHTML;

const markSelected = id => {
  for (const [nid, el] of Object.entries(nodeEls)) if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', nid === id);
};

function select(id) {
  stopFlow();
  selected = id;
  markSelected(id);
  restore();
  if (!id) return (details.innerHTML = INTRO);
  const n = byId[id];
  const links = EDGES.filter(([a, b]) => a === id || b === id)
    .map(([a, b, what]) => h('li', {}, a === id ? `→ ${byId[b].name} : ` : `← ${byId[a].name} : `, what));
  const used = PROJECTS.filter(([p]) => n.projects.includes(p)).map(([, name]) => name);
  const close = h('button', { type: 'button', class: 'details-close', 'aria-label': 'Fermer la fiche' }, '×');
  close.addEventListener('click', () => { select(null); nodeEls[id].focus(); });
  details.replaceChildren(
    close,
    h('p', { class: 'details-eyebrow' }, n.sub),
    h('h2', { class: 'details-title' }, n.name),
    h('p', {}, n.role),
    h('dl', { class: 'details-facts' },
      used.length ? h('div', {}, h('dt', {}, 'Sert à'), h('dd', {}, used.join(', '))) : null,
      n.cost ? h('div', {}, h('dt', {}, 'Coût'), h('dd', {}, n.cost)) : null,
      n.code ? h('div', {}, h('dt', {}, 'Dans le code'), h('dd', {}, ...n.code.map(c => h('code', {}, c)))) : null,
    ),
    links.length ? h('h3', {}, 'Liens') : null,
    links.length ? h('ul', { class: 'details-links' }, ...links) : null,
    n.url ? h('a', { class: 'details-url', href: n.url, target: '_blank', rel: 'noopener' }, 'Site officiel ↗') : null,
  );
  if (matchMedia('(max-width: 60rem)').matches) details.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}

// --- Filtres par projet ---

const filters = $('filters');
for (const [p, name] of [[null, 'Tout'], ...PROJECTS]) {
  const b = h('button', { type: 'button', class: 'chip', 'aria-pressed': String(p === null) }, name);
  b.addEventListener('click', () => {
    stopFlow();
    project = p;
    selected = null;
    markSelected(null);
    details.innerHTML = INTRO;
    filters.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    restore();
  });
  filters.append(b);
}

// --- Parcours animés ---

const flowsEl = $('flows');
const dot = document.createElementNS(SVG, 'circle');
dot.setAttribute('r', '6');
dot.setAttribute('class', 'dot');
svg.append(dot);

const wait = ms => new Promise(r => setTimeout(r, ms));
const moveDot = (path, run) => new Promise(resolve => {
  const len = path.getTotalLength(), start = performance.now(), dur = 1300;
  dot.classList.add('is-on');
  const tick = now => {
    if (run !== flowRun) return resolve();
    const t = Math.min(1, (now - start) / dur), e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const p = path.getPointAtLength(len * e);
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    t < 1 ? requestAnimationFrame(tick) : resolve();
  };
  requestAnimationFrame(tick);
});

function stopFlow() {
  if (!flowRun) return;
  flowRun = 0;
  dot.classList.remove('is-on');
  flowsEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
}

async function playFlow(flow, button) {
  stopFlow();
  selected = null;
  markSelected(null);
  const run = (flowRun = Date.now());
  button.setAttribute('aria-pressed', 'true');
  const items = flow.steps.map(s => h('li', {}, s.text));
  details.replaceChildren(
    h('p', { class: 'details-eyebrow' }, 'Parcours'),
    h('h2', { class: 'details-title' }, flow.label),
    h('ol', { class: 'details-steps' }, ...items),
  );
  for (const [i, step] of flow.steps.entries()) {
    if (run !== flowRun) return;
    items.forEach((li, j) => li.classList.toggle('is-current', j === i));
    if (step.edge) {
      const [a, b] = step.edge;
      highlight({ nodes: [a, b], edges: [edgeKey(a, b)] }, true);
      if (!reduce) await moveDot(edgeEls[edgeKey(a, b)], run);
      await wait(reduce ? 2600 : 1500);
    } else {
      highlight({ nodes: [step.node] }, true);
      dot.classList.remove('is-on');
      await wait(2200);
    }
  }
  if (run !== flowRun) return;
  items.forEach(li => li.classList.remove('is-current'));
  stopFlow();
  restore();
}

for (const flow of FLOWS) {
  const b = h('button', { type: 'button', class: 'chip chip--play', 'aria-pressed': 'false', 'aria-controls': 'details' }, '▶ ', flow.label);
  b.addEventListener('click', () => (b.getAttribute('aria-pressed') === 'true' ? (stopFlow(), restore(), (details.innerHTML = INTRO)) : playFlow(flow, b)));
  flowsEl.append(b);
}

addEventListener('keydown', e => {
  if (e.key === 'Escape' && (selected || flowRun)) { stopFlow(); select(null); }
});
