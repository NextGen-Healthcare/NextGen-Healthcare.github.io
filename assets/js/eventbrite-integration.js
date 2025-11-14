// /assets/js/eventbrite-integration.js
// Displays events from GitHub Actions-synced Eventbrite data with filtering
(() => {
  "use strict";

  const VERSION = "12";
  const DATA_URL = `../assets/data/eventbrite-upcoming.json?v=${VERSION}`;
  
  let allEvents = [];
  let activeCategory = 'all';

  // Category detection based on event title
  function detectCategory(title) {
    const lower = title.toLowerCase();
    if (lower.includes('coffee')) return 'coffee';
    if (lower.includes('drink')) return 'drinks';
    if (lower.includes('working')) return 'working-groups';
    return 'network';
  }

  // Category display info
  const CATEGORIES = {
    'all': { emoji: '📅', label: 'All Events' },
    'coffee': { emoji: '☕', label: 'Coffee & Catch-Up' },
    'drinks': { emoji: '🍻', label: 'After-Work Drinks' },
    'working-groups': { emoji: '👥', label: 'Working Groups' },
    'network': { emoji: '🌐', label: 'Network Events' }
  };

  const escapeHTML = (s = "") =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

  function formatDate(dateString) {
    try {
      const d = new Date(dateString);
      if (isNaN(d)) return dateString;
      const day = d.getDate();
      const month = d.toLocaleDateString('en-GB', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  }

  function formatTime(dateString) {
    try {
      const d = new Date(dateString);
      if (isNaN(d)) return "";
      return d.toLocaleTimeString('en-GB', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "";
    }
  }

  function createEventCard(event) {
    const category = detectCategory(event.name);
    const categoryInfo = CATEGORIES[category];
    const title = event.name || "Event";
    const description = event.summary || event.description || "";
    const location = event.location || (event.is_online ? "Online Event" : "Location TBA");
    const imageUrl = event.logo_url || "";
    const eventUrl = event.url || "";
    
    return `
      <article class="event-card" data-category="${escapeHTML(category)}">
        ${imageUrl ? `
          <div class="event-image" style="background-image: url('${escapeHTML(imageUrl)}');">
            <div class="event-badges">
              ${event.is_free ? '<span class="badge badge-free">FREE</span>' : ''}
              ${event.is_sold_out ? '<span class="badge badge-sold-out">SOLD OUT</span>' : ''}
            </div>
          </div>
        ` : ''}
        <div class="event-content">
          <div class="event-category">
            <span aria-hidden="true">${categoryInfo.emoji}</span> ${escapeHTML(categoryInfo.label)}
          </div>
          <h3 class="event-title">${escapeHTML(title)}</h3>
          <div class="event-meta">
            <div class="meta-item">
              <span aria-hidden="true">📅</span>
              <span>${formatDate(event.start)}${event.start ? ` at ${formatTime(event.start)}` : ''}</span>
            </div>
            ${location ? `
              <div class="meta-item">
                <span aria-hidden="true">📍</span>
                <span>${escapeHTML(location)}</span>
              </div>
            ` : ''}
          </div>
          ${description ? `
            <p class="event-description">${escapeHTML(description.substring(0, 200))}${description.length > 200 ? '...' : ''}</p>
          ` : ''}
          <a href="${escapeHTML(eventUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
            Register on Eventbrite →
          </a>
        </div>
      </article>
    `;
  }

  function renderEvents() {
    const container = document.getElementById('eventbrite-events-container');
    if (!container) return;

    // Filter events based on active category
    const filteredEvents = activeCategory === 'all' 
      ? allEvents 
      : allEvents.filter(event => detectCategory(event.name) === activeCategory);

    if (filteredEvents.length === 0) {
      container.innerHTML = `
        <div class="no-events">
          <div class="no-events-icon">📅</div>
          <h3>No events found</h3>
          <p>There are no ${activeCategory === 'all' ? '' : CATEGORIES[activeCategory].label.toLowerCase() + ' '}events scheduled at the moment.</p>
          <p>Check back soon or try a different filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredEvents.map(createEventCard).join('');
  }

  function setupFilters() {
    const filterContainer = document.getElementById('event-filters');
    if (!filterContainer) return;

    // Count events per category
    const counts = {
      all: allEvents.length,
      coffee: 0,
      drinks: 0,
      'working-groups': 0,
      network: 0
    };

    allEvents.forEach(event => {
      const category = detectCategory(event.name);
      counts[category]++;
    });

    // Create filter buttons
    const buttons = Object.entries(CATEGORIES).map(([key, info]) => {
      const count = counts[key];
      const isActive = activeCategory === key;
      return `
        <button 
          class="filter-btn ${isActive ? 'active' : ''}" 
          data-category="${key}"
          aria-pressed="${isActive}"
        >
          <span aria-hidden="true">${info.emoji}</span>
          ${escapeHTML(info.label)}
          <span class="filter-count">(${count})</span>
        </button>
      `;
    }).join('');

    filterContainer.innerHTML = buttons;

    // Add click handlers
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        
        // Update active states
        filterContainer.querySelectorAll('.filter-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.category === activeCategory);
          b.setAttribute('aria-pressed', b.dataset.category === activeCategory);
        });
        
        renderEvents();
      });
    });
  }

  async function loadEvents() {
    const container = document.getElementById('eventbrite-events-container');
    const loadingEl = document.getElementById('eventbrite-loading');
    const errorEl = document.getElementById('eventbrite-error');
    
    if (!container) return;

    // Show loading state
    if (loadingEl) loadingEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    container.style.display = 'none';

    try {
      const response = await fetch(DATA_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      allEvents = data.events || [];

      console.log(`✅ Loaded ${allEvents.length} events from Eventbrite`);
      console.log(`Last updated: ${data.updated_at}`);

      if (loadingEl) loadingEl.style.display = 'none';

      if (allEvents.length === 0) {
        container.style.display = 'block';
        container.innerHTML = `
          <div class="no-events">
            <div class="no-events-icon">📅</div>
            <h3>No upcoming events</h3>
            <p>We don't have any events scheduled at the moment.</p>
            <p>Check back soon for coffee catch-ups, drinks, working groups, and network events!</p>
          </div>
        `;
        return;
      }

      container.style.display = 'grid';
      setupFilters();
      renderEvents();

    } catch (error) {
      console.error('❌ Error loading events:', error);
      
      if (loadingEl) loadingEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        const errorDetails = errorEl.querySelector('.error-details');
        if (errorDetails) errorDetails.textContent = error.message;
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEvents);
  } else {
    loadEvents();
  }
})();
