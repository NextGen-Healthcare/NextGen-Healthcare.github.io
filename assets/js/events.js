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

  let EVENTS = [];
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

  // ---------- Render
  function cardHTML(ev) {
    const id = ev.id || ("ev_" + Math.random().toString(36).slice(2, 8));
    const cat = ev.category || "other";
    return `
<article class="card event" role="listitem" data-cat="${escapeHTML(cat)}" data-id="${escapeHTML(id)}">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  <div class="p-6">
    <h3 class="mb-0">
      <button class="event-title" aria-expanded="false" aria-controls="popover-${escapeHTML(id)}" id="title-${escapeHTML(id)}">
        ${escapeHTML(ev.title || "Untitled Event")}
      </button>
    </h3>
    <p class="meta" style="opacity:.85;margin:.5rem 0 0;">
      <span aria-hidden="true">📅</span> ${formatDate(ev.date)}${ev.time ? ` · ${escapeHTML(ev.time)}` : ""} &nbsp;
      <span aria-hidden="true">📍</span> ${escapeHTML(ev.location || "")}
    </p>
  </div>

  <div class="event-popover" id="popover-${escapeHTML(id)}" role="dialog" aria-labelledby="title-${escapeHTML(id)}" aria-hidden="true">
    <div class="event-popover-inner">
      <button class="popover-close" aria-label="Close">×</button>
      <h4 class="popover-title">${escapeHTML(ev.title || "Event details")}</h4>
      ${
        ev.details
          ? `<p class="popover-body">${escapeHTML(ev.details)}</p>`
          : (ev.short ? `<p class="popover-body">${escapeHTML(ev.short)}</p>` : `<p class="popover-body">More details coming soon.</p>`)
      }
      ${
        ev.link
          ? `<p style="margin-top:.75rem;"><a class="btn btn-outline size-sm" href="${ev.link}" target="_blank" rel="noopener">Event page</a></p>`
          : ""
      }
    </div>
  </div>
</article>`;
  }

  function renderEvents() {
    listEl.innerHTML = EVENTS.map(cardHTML).join("");
    emptyEl.classList.toggle("hidden", EVENTS.length > 0);
  }

  // ---------- Popovers
  function closeAllPopovers(exceptId = null) {
    qsa(".event-popover").forEach(pop => {
      if (pop.id !== exceptId) {
        pop.classList.remove("open");
        pop.setAttribute("aria-hidden", "true");
      }
    });
    qsa(".event-title").forEach(btn => btn.setAttribute("aria-expanded", "false"));
  }

  function openPopover(pop, btn) {
    closeAllPopovers(pop.id);
    pop.classList.add("open");
    pop.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    const closeBtn = qs(".popover-close", pop);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function togglePopoverForButton(btn) {
    const popId = btn.getAttribute("aria-controls");
    const pop = byId(popId);
    if (!pop) return;
    const isOpen = pop.classList.contains("open");
    if (isOpen) {
      pop.classList.remove("open");
      pop.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-expanded", "false");
      btn.focus({ preventScroll: true });
    } else {
      openPopover(pop, btn);
    }
  }

  // Delegate clicks inside the list
  function wireListInteractions() {
    listEl.addEventListener("click", (e) => {
      const titleBtn = e.target.closest(".event-title");
      if (titleBtn) {
        e.preventDefault();
        togglePopoverForButton(titleBtn);
        return;
      }
      const closeBtn = e.target.closest(".popover-close");
      if (closeBtn) {
        const pop = closeBtn.closest(".event-popover");
        if (!pop) return;
        const btn = qs(`.event-title[aria-controls="${pop.id}"]`, listEl);
        pop.classList.remove("open");
        pop.setAttribute("aria-hidden", "true");
        if (btn) {
          btn.setAttribute("aria-expanded", "false");
          btn.focus({ preventScroll: true });
        }
      }
    });

    // Click outside closes
    document.addEventListener("click", (e) => {
      const insideCard = e.target.closest(".card.event");
      const insidePopover = e.target.closest(".event-popover.open");
      if (!insideCard && !insidePopover) closeAllPopovers();
    });

    // Esc closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllPopovers();
    });
  }

  // ---------- Filters
  function applyFilter() {
    const cards = qsa(".card.event", listEl);
    let shown = 0;
    cards.forEach(card => {
      const cat = card.getAttribute("data-cat");
      const show = (activeCat === "all" || cat === activeCat);
      card.style.display = show ? "" : "none";
      if (show) shown++;
    });
    emptyEl.classList.toggle("hidden", shown > 0);
    closeAllPopovers();
  }

  function wireFilters() {
    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        activeCat = btn.getAttribute("data-cat");
        applyFilter();
      });
    });
  }

  // ---------- Init
  async function init() {
    // Optional: show a tiny loading state
    listEl.innerHTML = `<p class="center" style="grid-column:1/-1;opacity:.8;">Loading events…</p>`;

    EVENTS = await loadEvents();
    renderEvents();
    wireListInteractions();
    wireFilters();
    applyFilter();

    // Expose for debugging if needed
    window.NEXTGEN_EVENTS = EVENTS;
  }

  init();
})();
