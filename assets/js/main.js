// assets/js/main.js

// ------- Mobile nav toggle -------
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// ------- Current year in footer -------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ------- Category helpers (map slugs -> display + styling) -------
const CATEGORY_META = {
  coffee:       { label: 'Coffee & Catch-Ups',   badgeClass: 'bg-accent text-accent-foreground' },
  iheem:        { label: 'IHEEM Gatherings',     badgeClass: 'bg-primary text-primary-foreground' },
  'all-network':{ label: 'Network Sessions',     badgeClass: 'bg-secondary text-secondary-foreground' },
  drinks:       { label: 'After Work Drinks',    badgeClass: 'bg-muted text-muted-foreground' },
};

function categoryLabel(slug) {
  return (CATEGORY_META[slug] && CATEGORY_META[slug].label) || 'Network Sessions';
}
function categoryBadgeClass(slug) {
  return (CATEGORY_META[slug] && CATEGORY_META[slug].badgeClass) || 'bg-accent text-accent-foreground';
}

const VERSION = "9";
const DATA_URL   = `../assets/data/gallery.json?v=${VERSION}`;
const EVENTS_URL = `../assets/data/events.json?v=${VERSION}`;

// ------- Date helpers -------
const todayISO = () => new Date().toISOString().slice(0,10);
function formatDateISOToNice(iso) {
  const d = new Date(iso);
  // e.g. "Fri, 15 Nov 2025"
  return d.toLocaleDateString(undefined, { weekday:'short', year:'numeric', month:'short', day:'numeric' });
}

// ------- Card renderer (mirrors the React EventCard structure) -------
function renderEventCard(e) {
  const niceDate = formatDateISOToNice(e.date);
  const badge = categoryBadgeClass(e.category);
  const catText = categoryLabel(e.category);
  // Using Tailwind-ish class names so it resembles the React version.
  // Your CSS can map these (or just keep your existing .card styles).
  return `
  <div class="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group card event">
    <div class="h-2 bg-gradient-accent"></div>
    <div class="p-6">
      <div class="flex items-start justify-between mb-4" style="display:flex; justify-content:space-between; align-items:flex-start; gap:.75rem;">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${badge}" style="display:inline-block;">${catText}</span>
      </div>

      <h3 class="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">${e.title}</h3>

      <p class="text-muted-foreground text-sm mb-4 line-clamp-2">${e.summary || ''}</p>

      <div class="space-y-2 mb-4">
        <div class="flex items-center text-muted-foreground text-sm" style="display:flex; align-items:center; gap:.5rem;">
          <span aria-hidden="true">📅</span> <span>${niceDate}</span>
        </div>
        ${e.time ? `
        <div class="flex items-center text-muted-foreground text-sm" style="display:flex; align-items:center; gap:.5rem;">
          <span aria-hidden="true">⏰</span> <span>${e.time}</span>
        </div>` : ''}
        <div class="flex items-center text-muted-foreground text-sm" style="display:flex; align-items:center; gap:.5rem;">
          <span aria-hidden="true">📍</span> <span>${e.location}</span>
        </div>
      </div>

      <a class="btn btn-outline w-full" href="${e.rsvp || '#'}" target="_blank" rel="noopener">RSVP Now</a>
    </div>
  </div>`;
}

// ------- Data helpers -------
function getUpcoming(events, { limit = null, category = null } = {}) {
  const base = (events || [])
    .filter(e => new Date(e.date) >= new Date(todayISO()))
    .sort((a,b) => new Date(a.date) - new Date(b.date));
  const filtered = category && category !== 'all' ? base.filter(e => e.category === category) : base;
  return limit ? filtered.slice(0, limit) : filtered;
}

// ------- Home: featured events -------
const homeTarget = document.getElementById('home-events');
if (homeTarget) {
  const limit = Number(homeTarget.dataset.limit || 3);
  const upcoming = getUpcoming(window.NEXTGEN_EVENTS, { limit });
  homeTarget.innerHTML = upcoming.map(renderEventCard).join('');
}

const skip = document.querySelector('.skip-link');
if (skip) {
  skip.addEventListener('click', () => {
    const id = (skip.getAttribute('href') || '').replace('#','');
    const target = document.getElementById(id);
    if (target) setTimeout(() => target.focus(), 0);
  });
}

// HTML includes: load any [data-include] partials
document.querySelectorAll('[data-include]').forEach(async (el) => {
  try {
    const url = el.getAttribute('data-include');
    const res = await fetch(url);
    const html = await res.text();
    el.insertAdjacentHTML('afterend', html);
    el.remove();
    // ensure the year is set for dynamically injected footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  } catch (e) {
    console.error('Include failed:', e);
  }
});


// ------- Events page (full list + filters) -------
const listTarget = document.getElementById('events-list');
const emptyTarget = document.getElementById('events-empty');
const catButtons = document.querySelectorAll('[data-cat]');

function renderEventsPage(category = 'all') {
  if (!listTarget) return;
  const items = getUpcoming(window.NEXTGEN_EVENTS, { category });
  if (items.length === 0) {
    if (emptyTarget) emptyTarget.style.display = 'block';
    listTarget.innerHTML = '';
    return;
  }
  if (emptyTarget) emptyTarget.style.display = 'none';
  listTarget.innerHTML = items.map(renderEventCard).join('');
}

if (listTarget) {
  // initial render
  renderEventsPage('all');

  // filter buttons
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat') || 'all';
      // active state
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // render filtered
      renderEventsPage(cat);
    });
  });
}
