// /assets/js/gallery.js
(() => {
  const DATA_URL = "../assets/data/gallery.json";
  const CATEGORIES = [
    "All Events",
    "Coffee & Catch-Ups",
    "IHEEM Gatherings",
    "Network Sessions",
    "After Work Drinks",
    "SIG Events",
  ];

  // DOM
  const filtersEl = document.getElementById("gallery-filters");
  const gridEl = document.getElementById("gallery-grid");
  const emptyEl = document.getElementById("gallery-empty");

  const modal = document.getElementById("gallery-modal-root");
  const imgEl = document.getElementById("lightbox-image");
  const titleEl = document.getElementById("gallery-modal-title");
  const descEl = document.getElementById("gallery-modal-desc");
  const idxEl = document.getElementById("lightbox-index");
  const totEl = document.getElementById("lightbox-total");
  const btnPrev = modal.querySelector(".prev");
  const btnNext = modal.querySelector(".next");
  const btnClose = modal.querySelector(".close-btn");

  // State
  let ITEMS = [];
  let ACTIVE_CAT = "All Events";
  let ACTIVE_ITEM = null;
  let ACTIVE_INDEX = 0;
  let lastFocus = null;

  const escapeHTML = (s = "") =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  };

  function readQuery() {
    const q = new URLSearchParams(location.search);
    const type = q.get("type");
    if (type && CATEGORIES.includes(type)) ACTIVE_CAT = type;
  }
  function writeQuery() {
    const q = new URLSearchParams(location.search);
    if (ACTIVE_CAT && ACTIVE_CAT !== "All Events") {
      q.set("type", ACTIVE_CAT);
    } else {
      q.delete("type");
    }
    const url = `${location.pathname}?${q.toString()}`;
    history.replaceState(null, "", url.endsWith("?") ? url.slice(0, -1) : url);
  }

  function renderFilters() {
    filtersEl.innerHTML = CATEGORIES.map(cat => (
      `<button class="chip${cat === ACTIVE_CAT ? " active" : ""}" role="tab" aria-selected="${cat === ACTIVE_CAT}" data-cat="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`
    )).join("");
  }

  function renderGrid() {
    const list = ITEMS.filter(it => ACTIVE_CAT === "All Events" || it.category === ACTIVE_CAT);

    gridEl.innerHTML = "";
    emptyEl.classList.toggle("hidden", list.length > 0);

    const frag = document.createDocumentFragment();
    list.forEach((it) => {
      if (!it.photos || !it.photos.length) return; // skip empty galleries
      const cover = it.photos[0];
      const a = document.createElement("a");
      a.href = "#";
      a.className = "tile card";
      a.setAttribute("role", "button");
      a.setAttribute("aria-label", `Open gallery: ${it.title}`);
      a.innerHTML = `
        <figure class="tile-media">
          <img loading="lazy" src="${cover.src}" alt="${escapeHTML(cover.alt || it.title)}">
        </figure>
        <div class="tile-meta">
          <span class="badge">${escapeHTML(it.category)}</span>
          <h3>${escapeHTML(it.title)}</h3>
          <p class="muted">${fmtDate(it.date)}${it.location ? " • " + escapeHTML(it.location) : ""}</p>
        </div>
      `;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(it, 0);
      });
      frag.appendChild(a);
    });
    gridEl.appendChild(frag);
  }

  function openModal(item, startIndex = 0) {
    ACTIVE_ITEM = item;
    ACTIVE_INDEX = Math.max(0, Math.min(startIndex, item.photos.length - 1));
    lastFocus = document.activeElement;

    updateSlide();
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    btnClose.focus();
    addModalListeners();
  }

  function closeModal() {
    removeModalListeners();
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    ACTIVE_ITEM = null;
    ACTIVE_INDEX = 0;
  }

  function updateSlide() {
    if (!ACTIVE_ITEM) return;
    const p = ACTIVE_ITEM.photos[ACTIVE_INDEX];
    imgEl.src = p.src;
    imgEl.alt = p.alt || ACTIVE_ITEM.title || "Gallery image";
    titleEl.textContent = ACTIVE_ITEM.title || "";
    const dateBits = fmtDate(ACTIVE_ITEM.date);
    descEl.textContent = [ACTIVE_ITEM.category, dateBits].filter(Boolean).join(" • ");
    idxEl.textContent = String(ACTIVE_INDEX + 1);
    totEl.textContent = String(ACTIVE_ITEM.photos.length);
  }

  function nextSlide() {
    if (!ACTIVE_ITEM) return;
    ACTIVE_INDEX = (ACTIVE_INDEX + 1) % ACTIVE_ITEM.photos.length;
    updateSlide();
  }
  function prevSlide() {
    if (!ACTIVE_ITEM) return;
    ACTIVE_INDEX = (ACTIVE_INDEX - 1 + ACTIVE_ITEM.photos.length) % ACTIVE_ITEM.photos.length;
    updateSlide();
  }

  function onKey(e) {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") { e.preventDefault(); closeModal(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); nextSlide(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prevSlide(); }
  }

  function addModalListeners() {
    btnClose.addEventListener("click", closeModal);
    btnNext.addEventListener("click", nextSlide);
    btnPrev.addEventListener("click", prevSlide);
    window.addEventListener("keydown", onKey);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(); // click backdrop to close
    });
  }
  function removeModalListeners() {
    btnClose.removeEventListener("click", closeModal);
    btnNext.removeEventListener("click", nextSlide);
    btnPrev.removeEventListener("click", prevSlide);
    window.removeEventListener("keydown", onKey);
    modal.removeEventListener("click", closeModal);
  }

  function attachFilterHandlers() {
    filtersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-cat]");
      if (!btn) return;
      ACTIVE_CAT = btn.dataset.cat;
      renderFilters();
      renderGrid();
      writeQuery();
    });
  }

  async function loadData() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      // Fallback: window.nextgen.gallery if present
      return (window.nextgen && Array.isArray(window.nextgen.gallery) && window.nextgen.gallery) || [];
    }
  }

  function normalizeItems(raw) {
    // Ensure required fields exist. Keep only valid categories.
    const allowed = new Set(CATEGORIES.filter(c => c !== "All Events"));
    return raw
      .filter(it => it && it.title && it.photos && it.photos.length)
      .map(it => ({
        id: it.id || crypto.randomUUID(),
        title: String(it.title),
        date: it.date || "",
        category: allowed.has(it.category) ? it.category : "Network Sessions",
        location: it.location || "",
        photos: it.photos.map(p => ({ src: p.src, alt: p.alt || it.title })),
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  async function init() {
    readQuery();
    renderFilters();
    attachFilterHandlers();

    const data = await loadData();
    ITEMS = normalizeItems(data);
    renderGrid();
    writeQuery(); // ensure URL reflects active filter (if any)
  }

  document.addEventListener("DOMContentLoaded", init);
})();
