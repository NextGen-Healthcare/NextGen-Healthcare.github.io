// /assets/js/sigs.js
(() => {
  "use strict";

  const DATA_URL = "../assets/data/sigs.json"; // path is from /pages/sigs.html
  const JOIN_EMAIL = "nghnteam@gmail.com";

  // ---------- DOM helpers
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const listEl  = byId("sigs-list");
  const emptyEl = byId("sigs-empty");
  const modalRoot = byId("event-modal-root");

  let SIGS = [];
  let BY_ID = {};
  let lastFocusEl = null;

  const escapeHTML = (s = "") =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

function buildJoinHref(sig) {
  const name = sig?.name || "SIG";
  const subject = `Join SIG: ${name}`;

  const body = [
    "Hi NextGen team,",
    "",
    `I'd like to join the ${name} SIG.`,
    "",
    "Name:",
    "Organisation:",
    "Role:",
    "Location:",
    "LinkedIn / Contact:",
    "",
    "Thanks!"
  ].join("\r\n"); // CRLF is safest for email

  return `mailto:${JOIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}


  // Accepts leads as array of strings or objects with {name}; outputs plain text (no mailto)
  function leadsInline(sig) {
    if (!Array.isArray(sig?.leads) || !sig.leads.length) return "TBC";
    return sig.leads.map(l => {
      if (typeof l === "string") return escapeHTML(l);
      if (l && typeof l.name === "string") return escapeHTML(l.name);
      return "Lead";
    }).join(", ");
  }

  // ---------- Card template
  function cardHTML(sig) {
    const id = sig.id || ("sig_" + Math.random().toString(36).slice(2, 8));
    const joinHref = buildJoinHref(sig);
    const leadsLine = leadsInline(sig);

    return `
<article class="card sig" role="listitem" data-id="${escapeHTML(id)}">
  <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
  <div class="p-6">
    <h3 class="mb-0">
      <button class="sig-title event-title" data-id="${escapeHTML(id)}" aria-haspopup="dialog">
        ${escapeHTML(sig.name || "SIG")}
      </button>
    </h3>
    <p class="meta-line" style="margin:.5rem 0 0;">
      <span aria-hidden="true">📅</span> ${escapeHTML(sig.meeting || "Cadence TBC")}
      &nbsp; <span aria-hidden="true">💬</span> ${escapeHTML(sig.channel || "Channel TBC")}
    </p>
    ${sig.short ? `<p style="margin:.5rem 0 0; opacity:.9;">${escapeHTML(sig.short)}</p>` : ""}
    <p class="muted" style="margin:.5rem 0 0;">
      <span aria-hidden="true">👥</span> <strong>Leads:</strong> ${leadsLine}
    </p>
    <div class="card-actions">
      <a class="btn btn-primary size-sm" href="${joinHref}">Email to join</a>
      <button class="btn btn-outline size-sm btn-details" data-id="${escapeHTML(id)}">Details</button>
    </div>
  </div>
</article>`;
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = SIGS.map(cardHTML).join("");
    emptyEl?.classList.toggle("hidden", SIGS.length > 0);
    wireCardInteractions();
  }

  // ---------- Modal (reuses global .event-modal styles)
  function buildModalHTML(sig) {
    const id = sig.id || "sig";
    const joinHref = buildJoinHref(sig);
    const leadsLine = leadsInline(sig);

    return `
<div class="event-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title-${escapeHTML(id)}" data-modal-id="${escapeHTML(id)}">
  <div class="event-modal">
    <div class="h-2 bg-gradient-accent" aria-hidden="true"></div>
    <div class="modal-inner">
      <div class="modal-header">
        <h3 class="modal-title" id="modal-title-${escapeHTML(id)}">${escapeHTML(sig.name || "SIG details")}</h3>
        <button class="modal-close" aria-label="Close">×</button>
      </div>

      <p class="modal-meta" style="margin-top:.25rem;">
        <span aria-hidden="true">📅</span> ${escapeHTML(sig.meeting || "Cadence TBC")} &nbsp;
        <span aria-hidden="true">💬</span> ${escapeHTML(sig.channel || "Channel TBC")} &nbsp;
        <span aria-hidden="true">👥</span> ${leadsLine}
      </p>

      <div class="modal-body">
        ${sig.details ? `<p style="margin:0 0 1rem; opacity:.95;">${escapeHTML(sig.details)}</p>` : ""}
        ${Array.isArray(sig.tags) && sig.tags.length
          ? `<p style="margin:.5rem 0 0;"><strong>Tags:</strong> ${sig.tags.map(t => escapeHTML(t)).join(", ")}</p>` : ""}
      </div>

      <div class="modal-actions">
        <a class="btn btn-primary size-lg" href="${joinHref}">Email to join</a>
        <button class="btn btn-outline size-lg modal-close">Close</button>
      </div>
    </div>
  </div>
</div>`;
  }

  function openModal(sig) {
    if (!sig || !modalRoot) return;
    closeModal();
    modalRoot.innerHTML = buildModalHTML(sig);
    modalRoot.removeAttribute("aria-hidden");

    lastFocusEl = document.activeElement;

    const overlay = qs(".event-modal-overlay", modalRoot);
    const closeBtns = qsa(".modal-close", overlay);

    function onEsc(e){ if (e.key === "Escape") closeModal(); }
    function onOverlayClick(e){ if (e.target === overlay) closeModal(); }

    closeBtns.forEach(btn => btn.addEventListener("click", closeModal));
    document.addEventListener("keydown", onEsc);
    overlay.addEventListener("click", onOverlayClick);
    overlay._cleanup = () => {
      document.removeEventListener("keydown", onEsc);
      overlay.removeEventListener("click", onOverlayClick);
    };

    closeBtns[0]?.focus({ preventScroll: true });
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

  function wireCardInteractions() {
    listEl.addEventListener("click", (e) => {
      const titleBtn = e.target.closest(".sig-title");
      const detailsBtn = e.target.closest(".btn-details");
      const id = titleBtn?.getAttribute("data-id") || detailsBtn?.getAttribute("data-id");
      if (!id) return;
      e.preventDefault();
      openModal(BY_ID[id]);
    });
  }

  // ---------- Load + init
  async function loadSIGs() {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("sigs.json must be an array");
      return data;
    } catch (err) {
      console.error("Failed to load sigs.json:", err);
      return [];
    }
  }

  async function init() {
    if (!listEl) return;
    // Loader text (your original file was cut off here, causing a syntax error)
    listEl.innerHTML = '<p class="center" style="opacity:.8;">Loading SIGs…</p>';

    SIGS = await loadSIGs();
    // Build a safe ID map (and ensure each item has an id)
    BY_ID = {};
    SIGS.forEach((s) => {
      const id = s.id || ("sig_" + Math.random().toString(36).slice(2, 8));
      s.id = id;
      BY_ID[id] = s;
    });

    if (SIGS.length === 0) {
      listEl.innerHTML = "";
      emptyEl?.classList.remove("hidden");
      return;
    }

    renderList();

    // Optional: open modal if URL hash matches a SIG id (e.g., sigs.html#sig-energy)
    const hash = (location.hash || "").replace(/^#/, "");
    if (hash && BY_ID[hash]) openModal(BY_ID[hash]);
  }

  // Run when DOM is ready (script is at the end of the body, but this is extra-safe)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
