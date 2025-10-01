// /assets/js/events.js
(() => {
  // Tell main.js that the Events page is already being managed here
  window.NEXTGEN_EVENTS_PAGE_MANAGED = true;

  // ---------- DOM helpers
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const listEl  = byId("events-list");
  const emptyEl = byId("events-empty");
  const filterBtns = qsa(".filters [data-cat]");
  const modalRoot = byId("event-modal-root");

  const VERSION = "9";
  const EVENTS_URL = `../assets/data/events.json?v=${VERSION}`;

  let EVENTS = [];
  let EVENT_BY_ID = {};
  let activeCat = "all";

  const escapeHTML = (s = "") =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

  const formatDate = (isoOrText) => {
    const d = new Date(isoOrText);
    if (isNaN(d)) return isoOrText || "";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  // ---------- Date helpers (avoid TZ gotchas by constructing local date-only)
  const dateOnly = (iso) => {
    if (!iso || typeof iso !== "string") return null;
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return new Date(+m[1], +m[2]-1, +m[3], 0, 0, 0, 0);
  };
  const startOfToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

  // ---------- Stable ID helper (prevents mismatches after re-render)
  function getId(ev) {
    if (!ev) return "";
    if (!ev._id) ev._id = ev.id || ("ev_" + Math.random().toString(36).slice(2, 8));
    return ev._id;
  }

  // ---------- Load data (pure JSON)
  async function loadEvents() {
    try {
      const res = await fetch(EVENTS_URL, { cache: "no-store" });
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
    const id = getId(ev);
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

  // ---------- Render list (filtered to today/future + category, sorted soonest→latest)
  function filteredEvents() {
    const today = startOfToday();
  
    // category filter
    const pool = (activeCat === "all")
      ? EVENTS
      : EVENTS.filter(ev => (ev.category || "other") === activeCat);
  
    // only upcoming (>= today) and sort
    return pool
      .filter(ev => {
        const d = dateOnly(ev.date);
        return d && d >= today;
      })
      .sort((a, b) => dateOnly(a.date) - dateOnly(b.date));
  }


  function renderList() {
    const items = filteredEvents();
    listEl.innerHTML = items.map(cardHTML).join("");
    emptyEl.classList.toggle("hidden", items.length > 0);
    wireListInteractions(); // rebind after re-render
  }

  // ---------- Modal
  function buildModalHTML(ev) {
    const id = getId(ev);
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
        <span aria-hidden="true">🏷️</span> ${escapeHTML(ev.categoryLabel || ev.category || "other")}
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
    function handleEsc(e){ if (e.key === "Escape") closeModal(); }
    function handleOverlayClick(e){ if (e.target === overlay) closeModal(); }
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

  // ---------- Past Event Highlights (unchanged order logic)
  function renderPastHighlights() {
    const wrap = document.getElementById("past-highlights");
    const empty = document.getElementById("past-empty");
    if (!wrap) return;

    const today = startOfToday();

    const mostRecentPast = (predicate) => {
      return EVENTS
        .filter(ev => {
          const d = dateOnly(ev.date);
          return d && d < today && predicate(ev);
        })
        .sort((a,b) => dateOnly(b.date) - dateOnly(a.date))[0] || null;
    };

    // 1) Network Sessions
    const h1 = mostRecentPast(ev => (ev.category || "") === "all-network");

    // 2) More recent of Coffee or Drinks
    const coffee = mostRecentPast(ev => (ev.category || "") === "coffee");
    const drinks = mostRecentPast(ev => (ev.category || "") === "drinks");
    const h2 = [coffee, drinks].filter(Boolean).sort((a,b) => dateOnly(b.date) - dateOnly(a.date))[0] || null;

    // 3) IHEEM or SIG (most recent of either)
    const h3 = mostRecentPast(ev => ["iheem","sig"].includes(ev.category || ""));


    const picks = [h1, h2, h3].filter(Boolean);

    const highlightCard = (ev) => {
      const id = getId(ev);
      return `
<article class="card highlight" role="listitem" data-id="${escapeHTML(id)}">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  <div class="p-6">
    <h3 class="mb-0">
      <button class="event-title" data-id="${escapeHTML(id)}" aria-haspopup="dialog">
        ${escapeHTML(ev.title || "Event")}
      </button>
    </h3>
    <p style="opacity:.85; margin:.5rem 0 1rem;">
      <span aria-hidden="true">📅</span> ${formatDate(ev.date)}${ev.time ? ` · ${escapeHTML(ev.time)}` : ""}
      &nbsp; <span aria-hidden="true">📍</span> ${escapeHTML(ev.location || "")}
    </p>
    ${ev.short ? `<p class="mb-0" style="opacity:.9;">${escapeHTML(ev.short)}</p>` : ""}
    ${ev.link ? `<p style="margin-top:.75rem;"><a class="btn btn-outline size-sm" href="${ev.link}" target="_blank" rel="noopener">Event page</a></p>` : ""}
  </div>
</article>`.trim();
    };

    if (picks.length) {
      wrap.innerHTML = picks.map(highlightCard).join("");
      empty?.classList.add("hidden");
    } else {
      wrap.innerHTML = "";
      empty?.classList.remove("hidden");
    }

    // open modal from highlight cards too
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".event-title");
      if (!btn) return;
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      if (!id) return;
      openModal?.(EVENT_BY_ID[id]);
    }, { once: true }); // bind once after first render
  }

  // ---------- Init
  async function init() {
    listEl.innerHTML = `<p class="center" style="grid-column:1/-1;opacity:.8;">Loading events…</p>`;

    EVENTS = await loadEvents();

    // Build stable IDs and quick lookup map
    EVENT_BY_ID = {};
    EVENTS.forEach(ev => { EVENT_BY_ID[getId(ev)] = ev; });

    renderList();
    wireFilters();
    renderPastHighlights();

    // expose for debugging
    window.NEXTGEN_EVENTS = EVENTS;
  }

  init();
})();
