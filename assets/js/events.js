// /assets/js/events.js
(() => {
  const DATA_URL = "../assets/data/events.json"; // path is from /pages/events.html

  // ---------- DOM helpers
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const listEl  = byId("events-list");
  const emptyEl = byId("events-empty");
  const filterBtns = qsa(".filters [data-cat]");
  const modalRoot = byId("event-modal-root");

  let EVENTS = [];
  let EVENT_BY_ID = {};
  let activeCat = "all";

  const escapeHTML = (s = "") =>
    s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

  const formatDate = (isoOrText) => {
    const d = new Date(isoOrText);
    if (isNaN(d)) return isoOrText || "";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  // ---------- Load data (pure JSON)
  async function loadEvents() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("events.json must be an array");
      return data;
    } catch (err) {
      console.error("Failed to load events.json:", err);
      return [];
    }
  }

  // ---------- Card template
  function cardHTML(ev) {
    const id = ev.id || ("ev_" + Math.random().toString(36).slice(2, 8));
    const cat = ev.category || "other";
    const hasLink = !!ev.link;
    return `
<article class="card event" role="listitem" data-cat="${escapeHTML(cat)}" data-id="${escapeHTML(id)}">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  <div class="p-6">
    <h3 class="mb-0">
      <button class="event-title" data-id="${escapeHTML(id)}" aria-haspopup="dialog" aria-expanded="false">
        ${escapeHTML(ev.title || "Untitled Event")}
      </button>
    </h3>
    <p class="meta" style="opacity:.85;margin:.5rem 0 0;">
      <span aria-hidden="true">📅</span> ${formatDate(ev.date)}${ev.time ? ` · ${escapeHTML(ev.time)}` : ""} &nbsp;
      <span aria-hidden="true">📍</span> ${escapeHTML(ev.location || "")}
    </p>
    <div class="card-actions">
      ${hasLink ? `<a class="btn btn-primary size-sm" href="${ev.link}" target="_blank" rel="noopener">RSVP</a>` : ""}
      <button class="btn btn-outline size-sm btn-details" data-id="${escapeHTML(id)}">Details</button>
    </div>
  </div>
</article>`;
  }

  // ---------- Render list (filtered)
  function filteredEvents() {
    if (activeCat === "all") return EVENTS;
    return EVENTS.filter(ev => (ev.category || "other") === activeCat);
  }

  function renderList() {
    const items = filteredEvents();
    listEl.innerHTML = items.map(cardHTML).join("");
    emptyEl.classList.toggle("hidden", items.length > 0);
    wireListInteractions(); // rebind after re-render
  }

  // ---------- Modal
  function buildModalHTML(ev) {
    const id = ev.id || "unknown";
    const hasLink = !!ev.link;
    const details = ev.details || ev.short || "More details coming soon.";
    return `
<div class="event-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title-${escapeHTML(id)}" data-modal-id="${escapeHTML(id)}">
  <div class="event-modal">
    <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
    <div class="modal-inner">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-title-${escapeHTML(id)}">${escapeHTML(ev.title || "Event details")}</h3>
        <button class="modal-close" aria-label="Close">×</button>
      </div>
      <p class="modal-meta">
        <span aria-hidden="true">📅</span> ${formatDate(ev.date)}${ev.time ? ` · ${escapeHTML(ev.time)}` : ""} &nbsp;
        <span aria-hidden="true">📍</span> ${escapeHTML(ev.location || "")} &nbsp;
        <span aria-hidden="true">🏷️</span> ${escapeHTML(ev.category || "other")}
      </p>
      <div class="modal-body">
        <p style="margin:0 0 1rem; opacity:.95;">${escapeHTML(details)}</p>
        ${ev.agenda ? `<h4>Agenda</h4><p>${escapeHTML(ev.agenda)}</p>` : ""}
        ${ev.speakers ? `<h4>Speakers</h4><p>${escapeHTML(ev.speakers)}</p>` : ""}
      </div>
      <div class="modal-actions">
        ${hasLink ? `<a class="btn btn-primary size-lg" href="${ev.link}" target="_blank" rel="noopener">RSVP / Event page</a>` : ""}
        <button class="btn btn-outline size-lg modal-close">Close</button>
      </div>
    </div>
  </div>
</div>`;
  }

  let lastFocusEl = null;

  function openModal(ev) {
    if (!ev) return;

    // Close any existing modal
    closeModal();

    // Inject modal
    modalRoot.innerHTML = buildModalHTML(ev);
    modalRoot.removeAttribute("aria-hidden");

    // Focus handling
    lastFocusEl = document.activeElement;
    const overlay = qs(".event-modal-overlay", modalRoot);
    const closeBtns = qsa(".modal-close", overlay);
    const firstClose = closeBtns[0];

    // Close handlers
    function handleEsc(e){
      if (e.key === "Escape") closeModal();
    }
    function handleOverlayClick(e){
      if (e.target === overlay) closeModal();
    }
    closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
    document.addEventListener("keydown", handleEsc);
    overlay.addEventListener("click", handleOverlayClick);

    // Store cleanup to overlay dataset
    overlay._cleanup = () => {
      document.removeEventListener("keydown", handleEsc);
      overlay.removeEventListener("click", handleOverlayClick);
    };

    // Focus inside modal
    if (firstClose) firstClose.focus({ preventScroll: true });
  }

  function closeModal() {
    const overlay = qs(".event-modal-overlay", modalRoot);
    if (!overlay) return;
    if (typeof overlay._cleanup === "function") overlay._cleanup();
    modalRoot.innerHTML = "";
    modalRoot.setAttribute("aria-hidden", "true");
    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus({ preventScroll: true });
    }
    lastFocusEl = null;
  }

  // ---------- Interactions
  function wireListInteractions() {
    // Title -> open modal
    qsa(".event-title", listEl).forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-id");
        openModal(EVENT_BY_ID[id]);
      });
    });

    // Details button -> open modal
    qsa(".btn-details", listEl).forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-id");
        openModal(EVENT_BY_ID[id]);
      });
    });
  }

  function wireFilters() {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        // Toggle active styling/ARIA
        filterBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");

        // Update category + re-render
        activeCat = btn.getAttribute("data-cat") || "all";
        renderList();
        // Close any open modal on filter change
        closeModal();
      });
    });
  }

  // ---------- Init
  async function init() {
    listEl.innerHTML = `<p class="center" style="grid-column:1/-1;opacity:.8;">Loading events…</p>`;

    EVENTS = await loadEvents();
    EVENT_BY_ID = Object.fromEntries(
      EVENTS.map(ev => [ev.id || ("ev_" + Math.random().toString(36).slice(2,8)), ev])
    );

    renderList();
    wireFilters();

    // expose for debugging
    window.NEXTGEN_EVENTS = EVENTS;
  }

  init();
})();
