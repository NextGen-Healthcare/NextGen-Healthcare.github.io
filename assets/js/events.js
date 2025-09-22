// assets/js/events.js
(() => {
  // ------------- Helpers
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHTML = (s = "") =>
    s.replace(/[&<>"']/g, (ch) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[ch]));

  const formatDate = (isoOrText) => {
    // Gracefully handle plain text dates too
    const d = new Date(isoOrText);
    if (isNaN(d.getTime())) return isoOrText;
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  };

  // ------------- Data
  const EVENTS = (window.NEXTGEN_EVENTS || [
    // Fallback sample events if NEXTGEN_EVENTS isn't defined
    {
      id: "e1",
      title: "Coffee & Catch-Up (London)",
      date: "2025-10-10",
      time: "08:00–09:00",
      location: "King’s Cross",
      category: "coffee",
      short: "Casual morning coffee to meet peers.",
      details: "Agenda: intros, lightning updates, peer asks. Hosts: NextGen team. Dress code: casual.",
      link: "#"
    },
    {
      id: "e2",
      title: "IHEEM Congress Meetup",
      date: "2025-11-05",
      time: "17:30–19:00",
      location: "Manchester Central",
      category: "iheem",
      short: "Informal meetup during IHEEM Congress.",
      details: "We’ll gather near the main entrance then move to a nearby venue. Bring a colleague!",
      link: "#"
    }
  ]);

  // ------------- Rendering
  const listEl = byId("events-list");
  const emptyEl = byId("events-empty");

  function cardHTML(ev) {
    const id = (ev.id || ("ev_" + Math.random().toString(36).slice(2, 8)));
    return `
<article class="card event" role="listitem" data-cat="${escapeHTML(ev.category || "other")}" data-id="${id}">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  <div class="p-6">
    <h3 class="mb-0">
      <button class="event-title" aria-expanded="false" aria-controls="popover-${id}" id="title-${id}">
        ${escapeHTML(ev.title)}
      </button>
    </h3>
    <p class="meta" style="opacity:.85;margin:.5rem 0 0;">
      <span aria-hidden="true">📅</span> ${formatDate(ev.date)}${ev.time ? ` · ${escapeHTML(ev.time)}` : ""} &nbsp;
      <span aria-hidden="true">📍</span> ${escapeHTML(ev.location || "")}
    </p>
  </div>

  <div class="event-popover" id="popover-${id}" role="dialog" aria-labelledby="title-${id}" aria-hidden="true">
    <div class="event-popover-inner">
      <button class="popover-close" aria-label="Close">×</button>
      <h4 class="popover-title">${escapeHTML(ev.title)}</h4>
      ${
        ev.details
          ? `<p class="popover-body">${escapeHTML(ev.details)}</p>`
          : (ev.short ? `<p class="popover-body">${escapeHTML(ev.short)}</p>` : "")
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
    emptyEl.classList.add("hidden");
  }

  // ------------- Popover controls
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

  // Delegate clicks (titles & close buttons)
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

  // Click outside closes any open popover
  document.addEventListener("click", (e) => {
    const insideCard = e.target.closest(".card.event");
    const insideOpenPopover = e.target.closest(".event-popover.open");
    if (!insideCard && !insideOpenPopover) {
      closeAllPopovers();
    }
  });

  // Escape closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPopovers();
  });

  // ------------- Filtering
  const filterBtns = qsa(".filters [data-cat]");
  let activeCat = "all";

  function applyFilter() {
    const cards = qsa(".card.event", listEl);
    let shown = 0;
    cards.forEach(card => {
      const cat = card.getAttribute("data-cat");
      const show = (activeCat === "all" || cat === activeCat);
      card.style.display = show ? "" : "none";
      if (show) shown += 1;
    });
    emptyEl.classList.toggle("hidden", shown > 0);
    closeAllPopovers();
  }

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

  // ------------- Boot
  renderEvents();
  applyFilter();
})();
