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


// Home: render featured events
const featuredTarget = document.getElementById('event-cards');
if (featuredTarget) {
const limit = Number(featuredTarget.dataset.limit || 3);
const upcoming = (window.NEXTGEN_EVENTS || []).filter(e => new Date(e.date) >= new Date())
.sort((a,b) => new Date(a.date) - new Date(b.date))
.slice(0, limit);
featuredTarget.innerHTML = upcoming.map(renderEventCard).join('');
}


// Events page: filters and lists
const listTarget = document.getElementById('events-list');
const pastTarget = document.getElementById('events-past');
const filterSelect = document.getElementById('filter-category');


function renderEventCard(e){
const d = new Date(e.date);
const dateFmt = d.toLocaleDateString(undefined, { weekday:'short', year:'numeric', month:'short', day:'numeric' });
return `
<article class="card">
<h3>${e.title}</h3>
<p class="meta">${dateFmt} · ${e.location} · ${categoryLabel(e.category)}</p>
<p>${e.summary}</p>
${e.rsvp ? `<a class="btn btn-small" href="${e.rsvp}" target="_blank" rel="noopener">RSVP</a>` : ''}
</article>
`;
}


function categoryLabel(key){
return ({
'coffee':'Coffee & Catch‑Ups',
'iheem':'IHEEM Gathering',
'all-network':'All Network Session',
'drinks':'After Work Drinks'
}
