/**
 * forage-season-card.js
 * Lovelace card for the Forage Season integration.
 *
 * Displays a single forageable species with its photo, common name,
 * scientific name, taxon type, observation count, and links.
 *
 * Usage:
 *   type: custom:forage-season-card
 *   entity: sensor.chanterelle
 *
 * Install: copy to <config>/www/forage-season-card.js
 * Add resource: /local/forage-season-card.js (JavaScript Module)
 *
 * Data sourced from the iNaturalist "Edible Flora & Fungi Worldwide" project.
 * https://www.inaturalist.org/projects/edible-flora-fungi-worldwide
 * Observations © iNaturalist contributors, licensed CC BY-NC.
 */

const PROJECT_NAME = "Edible Flora & Fungi Worldwide";
const PROJECT_URL  = "https://www.inaturalist.org/projects/edible-flora-fungi-worldwide";

class ForageSeasonCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) this._build();

    const entityId = this._config.entity;
    const state = hass.states[entityId];

    if (!state) {
      this.content.innerHTML = `<p class="error">Entity not found: ${entityId}</p>`;
      return;
    }

    const attr = state.attributes;
    const inSeason = state.state === "in_season";

    this._badge.textContent = inSeason ? "In Season" : "Out of Season";
    this._badge.className = "badge " + (inSeason ? "in-season" : "out-of-season");

    const iconic = attr.iconic_taxon || "";
    this._typePill.textContent = iconic === "Fungi" ? "🍄 Fungus" : iconic === "Plantae" ? "🌿 Plant" : "🌱 Species";

    if (attr.photo_url) {
      this._image.src = attr.photo_url;
      this._image.style.display = "block";
    } else {
      this._image.style.display = "none";
    }

    this._commonName.textContent = attr.common_name || attr.friendly_name || entityId;
    this._sciName.textContent = attr.scientific_name || "";
    this._obsCount.textContent = attr.observation_count
      ? `${attr.observation_count} observations this month`
      : "";

    this._inatLink.href = attr.inat_url || "#";
    this._inatLink.style.display = attr.inat_url ? "inline" : "none";
    this._wikiLink.href = attr.wikipedia_url || "#";
    this._wikiLink.style.display = attr.wikipedia_url ? "inline" : "none";

    // Project credit — use data_source_url from entity attrs if present,
    // fall back to the baked-in constant so attribution is always shown.
    this._projectLink.href = attr.data_source_url || PROJECT_URL;
    this._projectLink.textContent = attr.data_source || PROJECT_NAME;
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Please define an entity.");
    this._config = config;
  }

  _build() {
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: var(--primary-font-family, sans-serif);
        }
        .card {
          background: var(--card-background-color, #fff);
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,.15));
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: var(--secondary-background-color, #f0f0f0);
          overflow: hidden;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .5px;
          text-transform: uppercase;
        }
        .in-season  { background: #2e7d32; color: #fff; }
        .out-of-season { background: #616161; color: #fff; }
        .body {
          padding: 12px 14px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .type-pill {
          font-size: 11px;
          color: var(--secondary-text-color, #666);
          background: var(--secondary-background-color, #f0f0f0);
          border-radius: 8px;
          padding: 2px 8px;
        }
        .common-name {
          font-size: 17px;
          font-weight: 600;
          color: var(--primary-text-color, #212121);
          margin: 0;
          line-height: 1.2;
        }
        .sci-name {
          font-size: 13px;
          font-style: italic;
          color: var(--secondary-text-color, #666);
          margin: 0;
        }
        .obs-count {
          font-size: 12px;
          color: var(--secondary-text-color, #888);
          margin-top: 2px;
        }
        .links {
          display: flex;
          gap: 12px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .links a {
          font-size: 12px;
          color: var(--primary-color, #03a9f4);
          text-decoration: none;
        }
        .links a:hover { text-decoration: underline; }
        .attribution {
          border-top: 1px solid var(--divider-color, #e0e0e0);
          margin-top: 10px;
          padding-top: 8px;
          font-size: 10px;
          color: var(--secondary-text-color, #999);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .attribution a {
          color: var(--secondary-text-color, #999);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .attribution a:hover { color: var(--primary-color, #03a9f4); }
        .error { color: red; padding: 12px; }
      </style>

      <ha-card class="card">
        <div class="image-wrap">
          <img id="image" />
          <span id="badge" class="badge"></span>
        </div>
        <div class="body">
          <div class="top-row">
            <span id="type-pill" class="type-pill"></span>
          </div>
          <p class="common-name" id="common-name"></p>
          <p class="sci-name" id="sci-name"></p>
          <p class="obs-count" id="obs-count"></p>
          <div class="links">
            <a id="inat-link" target="_blank" rel="noopener">iNaturalist ↗</a>
            <a id="wiki-link" target="_blank" rel="noopener">Wikipedia ↗</a>
          </div>
          <div class="attribution">
            <span>📍 Data via</span>
            <a id="project-link" target="_blank" rel="noopener"></a>
            <span>· iNaturalist · CC BY-NC</span>
          </div>
        </div>
      </ha-card>
    `;

    this.content = shadow;
    this._image       = shadow.getElementById("image");
    this._badge       = shadow.getElementById("badge");
    this._typePill    = shadow.getElementById("type-pill");
    this._commonName  = shadow.getElementById("common-name");
    this._sciName     = shadow.getElementById("sci-name");
    this._obsCount    = shadow.getElementById("obs-count");
    this._inatLink    = shadow.getElementById("inat-link");
    this._wikiLink    = shadow.getElementById("wiki-link");
    this._projectLink = shadow.getElementById("project-link");
  }

  static getConfigElement() {
    return document.createElement("forage-season-card-editor");
  }

  static getStubConfig() {
    return { entity: "sensor.chanterelle" };
  }
}

customElements.define("forage-season-card", ForageSeasonCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "forage-season-card",
  name: "Forage Season Card",
  description: "Displays an in-season forageable plant or fungus from iNaturalist.",
  preview: false,
});
/**
 * forage-season-grid-card.js
 *
 * A self-contained Lovelace card that discovers all forage_season sensor
 * entities and renders them in a responsive grid or compact list.
 *
 * No auto-entities or other dependencies required.
 *
 * Usage (grid — default):
 *   type: custom:forage-season-grid-card
 *   title: "What's in season"       # optional
 *   layout: grid                    # "grid" (default) or "list"
 *   columns: 2                      # grid columns, default 2
 *   show_out_of_season: false       # show greyed-out cards too, default false
 *   sort: count                     # "count" (default) or "name"
 *   filter: plants                  # "all" (default), "plants", or "fungi"
 *   max: 20                         # cap displayed cards, default unlimited
 *
 * Install: copy to <config>/www/forage-season-grid-card.js
 * Add resource: /local/forage-season-grid-card.js (JavaScript Module)
 */

const DEFAULT_COLUMNS = 2;
const PROJECT_NAME = "Edible Flora & Fungi Worldwide";
const PROJECT_URL  = "https://www.inaturalist.org/projects/edible-flora-fungi-worldwide";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getForageEntities(hass, config) {
  const showOut = config.show_out_of_season === true;
  const filter  = config.filter || "all";
  const sort    = config.sort   || "count";
  const max     = config.max    || Infinity;

  let entities = Object.values(hass.states).filter(s => {
    if (!s.entity_id.startsWith("sensor.")) return false;
    // Identify our entities by the attributes the coordinator sets
    if (!("taxon_id" in s.attributes)) return false;
    if (!("observation_count" in s.attributes)) return false;
    return true;
  });

  // Filter by state
  if (!showOut) entities = entities.filter(s => s.state === "in_season");

  // Filter by taxon type
  if (filter === "plants") {
    entities = entities.filter(s => s.attributes.iconic_taxon === "Plantae");
  } else if (filter === "fungi") {
    entities = entities.filter(s => s.attributes.iconic_taxon === "Fungi");
  }

  // Sort
  if (sort === "name") {
    entities.sort((a, b) =>
      (a.attributes.common_name || "").localeCompare(b.attributes.common_name || "")
    );
  } else {
    // count desc (default)
    entities.sort((a, b) =>
      (b.attributes.observation_count || 0) - (a.attributes.observation_count || 0)
    );
  }

  return entities.slice(0, max);
}

function iconFor(iconic) {
  if (iconic === "Fungi")  return "🍄";
  if (iconic === "Plantae") return "🌿";
  return "🌱";
}

function monthName(month) {
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month - 1] || "";
}

// ─── Grid Card ──────────────────────────────────────────────────────────────

class ForageSeasonGridCard extends HTMLElement {

  setConfig(config) {
    this._config = config;
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass) return;

    const config   = this._config;
    const layout   = config.layout  || "grid";
    const columns  = config.columns || DEFAULT_COLUMNS;
    const title    = config.title;

    const entities = getForageEntities(this._hass, config);

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    const month = new Date().getMonth() + 1;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        ha-card {
          padding: 16px;
          box-sizing: border-box;
        }

        .header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 8px;
        }
        .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--primary-text-color);
          margin: 0;
        }
        .subtitle {
          font-size: 12px;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }

        /* ── GRID layout ── */
        .grid {
          display: grid;
          grid-template-columns: repeat(${columns}, 1fr);
          gap: 12px;
        }

        .grid-item {
          border-radius: 10px;
          overflow: hidden;
          background: var(--secondary-background-color);
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform .15s, box-shadow .15s;
        }
        .grid-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,.18);
        }
        .grid-item.out {
          opacity: .45;
          filter: grayscale(.6);
        }

        .thumb-wrap {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--divider-color);
          overflow: hidden;
          flex-shrink: 0;
        }
        .thumb-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .thumb-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }

        .grid-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0,0,0,.55);
          color: #fff;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: .3px;
        }
        .grid-badge.in  { background: rgba(46,125,50,.85); }
        .grid-badge.out { background: rgba(80,80,80,.75); }

        .grid-body {
          padding: 8px 10px 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .grid-type {
          font-size: 10px;
          color: var(--secondary-text-color);
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .grid-common {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .grid-sci {
          font-size: 11px;
          font-style: italic;
          color: var(--secondary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .grid-count {
          font-size: 10px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }

        /* ── LIST layout ── */
        .list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .list-item {
          display: grid;
          grid-template-columns: 52px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 10px 4px;
          border-bottom: 1px solid var(--divider-color);
          cursor: pointer;
          border-radius: 6px;
          transition: background .1s;
        }
        .list-item:last-child { border-bottom: none; }
        .list-item:hover { background: var(--secondary-background-color); }
        .list-item.out { opacity: .45; }

        .list-thumb {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          overflow: hidden;
          background: var(--divider-color);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .list-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .list-text { min-width: 0; }
        .list-common {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .list-sci {
          font-size: 12px;
          font-style: italic;
          color: var(--secondary-text-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .list-type-row {
          font-size: 11px;
          color: var(--secondary-text-color);
          margin-top: 1px;
        }

        .list-right {
          text-align: right;
          flex-shrink: 0;
        }
        .list-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--primary-text-color);
        }
        .list-count-label {
          font-size: 10px;
          color: var(--secondary-text-color);
        }
        .list-badge {
          display: inline-block;
          margin-top: 4px;
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 8px;
          font-weight: 600;
        }
        .list-badge.in  { background: #e8f5e9; color: #2e7d32; }
        .list-badge.out { background: #f0f0f0; color: #666; }

        /* ── Attribution footer ── */
        .attribution {
          border-top: 1px solid var(--divider-color);
          padding: 8px 4px 0;
          margin-top: 12px;
          font-size: 10px;
          color: var(--secondary-text-color);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }
        .attribution a {
          color: var(--secondary-text-color);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .attribution a:hover { color: var(--primary-color); }

        /* ── Empty state ── */
        .empty {
          text-align: center;
          padding: 32px 16px;
          color: var(--secondary-text-color);
          font-size: 14px;
          line-height: 1.5;
        }
        .empty-icon { font-size: 40px; margin-bottom: 8px; }
      </style>

      <ha-card>
        ${title || entities.length ? `
        <div class="header">
          ${title ? `<p class="title">${title}</p>` : '<p class="title">Forageables</p>'}
          <span class="subtitle">${entities.length} species · ${monthName(month)}</span>
        </div>` : ""}

        ${entities.length === 0 ? `
          <div class="empty">
            <div class="empty-icon">🌾</div>
            No in-season species found.<br>
            Try increasing the search radius or lowering the minimum observations threshold.
          </div>
        ` : layout === "list" ? `
          <div class="list">
            ${entities.map(s => this._listItem(s)).join("")}
          </div>
        ` : `
          <div class="grid">
            ${entities.map(s => this._gridItem(s)).join("")}
          </div>
        `}
        <div class="attribution">
          <span>📍 Data via</span>
          <a href="${PROJECT_URL}" target="_blank" rel="noopener">${PROJECT_NAME}</a>
          <span>on iNaturalist · Observations © contributors · CC BY-NC</span>
        </div>
      </ha-card>
    `;

    // Attach click handlers after render
    this.shadowRoot.querySelectorAll("[data-entity]").forEach(el => {
      el.addEventListener("click", () => {
        const entityId = el.dataset.entity;
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: { entityId },
          bubbles: true,
          composed: true,
        }));
      });
    });
  }

  _gridItem(state) {
    const a   = state.attributes;
    const out = state.state !== "in_season";
    const icon = iconFor(a.iconic_taxon);

    return `
      <div class="grid-item ${out ? "out" : ""}" data-entity="${state.entity_id}">
        <div class="thumb-wrap">
          ${a.photo_url
            ? `<img src="${a.photo_url}" alt="${a.common_name}" loading="lazy" />`
            : `<div class="thumb-placeholder">${icon}</div>`
          }
          <span class="grid-badge ${out ? "out" : "in"}">
            ${out ? "Out of Season" : "In Season"}
          </span>
        </div>
        <div class="grid-body">
          <span class="grid-type">${icon} ${a.iconic_taxon || "Species"}</span>
          <span class="grid-common">${a.common_name || state.entity_id}</span>
          <span class="grid-sci">${a.scientific_name || ""}</span>
          <span class="grid-count">${a.observation_count ? a.observation_count + " obs this month" : ""}</span>
        </div>
      </div>
    `;
  }

  _listItem(state) {
    const a   = state.attributes;
    const out = state.state !== "in_season";
    const icon = iconFor(a.iconic_taxon);

    return `
      <div class="list-item ${out ? "out" : ""}" data-entity="${state.entity_id}">
        <div class="list-thumb">
          ${a.photo_url
            ? `<img src="${a.photo_url}" alt="${a.common_name}" loading="lazy" />`
            : icon
          }
        </div>
        <div class="list-text">
          <div class="list-common">${a.common_name || state.entity_id}</div>
          <div class="list-sci">${a.scientific_name || ""}</div>
          <div class="list-type-row">${icon} ${a.iconic_taxon || "Species"}</div>
        </div>
        <div class="list-right">
          <div class="list-count">${a.observation_count ?? "—"}</div>
          <div class="list-count-label">obs</div>
          <span class="list-badge ${out ? "out" : "in"}">${out ? "Out" : "In Season"}</span>
        </div>
      </div>
    `;
  }

  static getConfigElement() {
    return document.createElement("forage-season-grid-card-editor");
  }

  static getStubConfig() {
    return {
      title: "What's in season",
      layout: "grid",
      columns: 2,
      sort: "count",
      filter: "all",
      show_out_of_season: false,
    };
  }

  // Required for card-picker size hint
  getCardSize() {
    return 4;
  }
}

customElements.define("forage-season-grid-card", ForageSeasonGridCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "forage-season-grid-card",
  name: "Forage Season Grid",
  description: "Displays all in-season forageable plants and fungi in a responsive grid or list. No auto-entities required.",
  preview: false,
});
