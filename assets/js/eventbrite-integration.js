// /assets/js/eventbrite-integration.js
// Displays events from GitHub Actions-synced Eventbrite data
(() => {
  "use strict";

  const ORGANIZER_ID = "77223082953";
  const ORGANIZER_URL = `https://www.eventbrite.com/o/nextgen-healthcare-network-${ORGANIZER_ID}`;
  const DATA_URL = "../assets/data/eventbrite-upcoming.json";
  const VERSION = "1";
  
  const container = document.getElementById("eventbrite-events-container");
  const loadingEl = document.getElementById("eventbrite-loading");
  const errorEl = document.getElementById("eventbrite-error");
  
  if (!container) return;

  const escapeHTML = (s = "") =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

  function formatDate(dateString) {
    try {
      const d = new Date(dateString);
      if (isNaN(d)) return dateString;
      return d.toLocaleDateString(undefined, { 
        weekday: 'short',
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  function formatTime(dateString) {
    try {
      const d = new Date(dateString);
      if (isNaN(d)) return "";
      return d.toLocaleTimeString(undefined, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "";
    }
  }

  function buildEventCard(event) {
    const title = event.name || "Event";
    const date = formatDate(event.start);
    const time = formatTime(event.start);
    const location = event.location || "Online";
    const url = event.url || "#";
    const summary = event.summary || event.description || "";
    const imageUrl = event.logo_url || "";
    const isSoldOut = event.is_sold_out || false;
    const isFree = event.is_free || false;

    return `
<article class="card event" role="listitem">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  ${imageUrl ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(title)}" style="width:100%;height:180px;object-fit:cover;">` : ""}
  <div class="p-6">
    ${isSoldOut ? '<span class="badge" style="background:#dc2626;color:#fff;padding:.25rem .5rem;border-radius:.375rem;font-size:.75rem;font-weight:600;">SOLD OUT</span>' : ''}
    ${isFree ? '<span class="badge" style="background:#059669;color:#fff;padding:.25rem .5rem;border-radius:.375rem;font-size:.75rem;font-weight:600;margin-left:.5rem;">FREE</span>' : ''}
    <h3 class="mb-0" style="margin-top:.5rem;">
      <a href="${escapeHTML(url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;">
        ${escapeHTML(title)}
      </a>
    </h3>
    <div class="meta-stack" style="margin-top:.5rem;">
      <div class="meta-line">
        <span aria-hidden="true">📅</span>
        ${escapeHTML(date)}${time ? ` · ${escapeHTML(time)}` : ""}
      </div>
      ${location ? `
      <div class="meta-line">
        <span aria-hidden="true">📍</span> ${escapeHTML(location)}
      </div>` : ""}
    </div>
    ${summary ? `<p style="margin:.75rem 0 0;opacity:.9;font-size:.9375rem;">${escapeHTML(summary.substring(0, 150))}${summary.length > 150 ? "..." : ""}</p>` : ""}
    <div class="card-actions" style="margin-top:1rem;">
      ${isSoldOut 
        ? '<button class="btn btn-outline size-sm" disabled>Sold Out</button>' 
        : `<a class="btn btn-primary size-sm" href="${escapeHTML(url)}" target="_blank" rel="noopener">Register on Eventbrite</a>`}
    </div>
  </div>
</article>`;
  }

  function showLoading() {
    if (loadingEl) loadingEl.classList.remove("hidden");
    if (errorEl) errorEl.classList.add("hidden");
    container.innerHTML = "";
  }

  function showError(message) {
    if (loadingEl) loadingEl.classList.add("hidden");
    if (errorEl) {
      errorEl.classList.remove("hidden");
      errorEl.innerHTML = `<p>${escapeHTML(message)}</p>`;
    }
  }

  function showEvents(events) {
    if (loadingEl) loadingEl.classList.add("hidden");
    if (errorEl) errorEl.classList.add("hidden");
    
    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="center" style="grid-column:1/-1;padding:2rem;">
          <p class="muted">No upcoming events at the moment. Check back soon!</p>
          <a class="btn btn-outline" href="${ORGANIZER_URL}" target="_blank" rel="noopener">View on Eventbrite</a>
        </div>`;
      return;
    }

    container.innerHTML = events.map(buildEventCard).join("");
  }

  async function fetchEvents() {
    showLoading();
    
    try {
      const response = await fetch(`${DATA_URL}?v=${VERSION}`, { cache: "no-store" });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.events)) {
        throw new Error("Invalid data format");
      }
      
      console.log(`Loaded ${data.count} events (updated: ${data.updated_at})`);
      showEvents(data.events);
      
    } catch (error) {
      console.error("Error fetching events:", error);
      
      // Show friendly error with link to Eventbrite
      if (errorEl) {
        errorEl.innerHTML = `
          <p class="muted" style="margin-bottom:1rem;">Unable to load events at the moment.</p>
          <a class="btn btn-primary" href="${ORGANIZER_URL}" target="_blank" rel="noopener">View Events on Eventbrite</a>
        `;
        errorEl.classList.remove("hidden");
      }
      if (loadingEl) loadingEl.classList.add("hidden");
    }
  }

  // Initialize
  fetchEvents();
})();
