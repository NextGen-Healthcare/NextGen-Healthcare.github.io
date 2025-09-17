// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
toggle.addEventListener('click', () => {
const isOpen = nav.classList.toggle('open');
toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
}


// Current year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


// Render home featured events
const homeTarget = document.getElementById('home-events');
if (homeTarget) {
const limit = Number(homeTarget.dataset.limit || 3);
const upcoming = (window.NEXTGEN_EVENTS || []).filter(e => new Date(e.date) >= new Date())
.sort((a,b) => new Date(a.date) - new Date(b.date))
.slice(0, limit);
homeTarget.innerHTML = upcoming.map(renderEventCard).join('');
}


// Events page
const listTarget = document.getElementById('events-list');
const emptyTarget = document.getElementById('events-empty');
const catButtons = document.querySelectorAll('[data-cat]');


function renderEventCard(e){
const d = new Date(e.date);
const dateFmt = d.toLocaleDateString(undefined, { weekday:'short', year:'numeric', month:'short', day:'numeric' });
return `
<article class="card event">
<h3>${e.title}</h3>
<p class="meta">${dateFmt}${e.time ? ` · ${e.time}`:''} · ${e.location} · ${categoryLabel(e.category)}</p>
if (emptyTarget
