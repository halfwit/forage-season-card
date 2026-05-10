// ================================================
// Forage Season Card for Home Assistant
// Supports forage-season-card and forage-season-grid-card
// Generic tap_action / hold_action support
// ================================================

class ForageSeasonCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You must define an entity");
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this._build();
    }
    this._update();
  }

  _build() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: var(--card-background-color, #1e1e1e);
          border-radius: 12px;
          padding: 12px;
          box-shadow: var(--ha-card-box-shadow, none);
        }
        .photo { width: 100%; border-radius: 8px; }
        .common-name { font-size: 1.4em; font-weight: bold; margin: 8px 0 4px; }
        .scientific { font-style: italic; color: var(--secondary-text-color); }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85em;
        }
        .in-season { background: #2e7d32; color: white; }
        .out-of-season { background: #d32f2f; color: white; }
      </style>
      <ha-card class="card">
        <div class="content"></div>
      </ha-card>
    `;
    this.content = shadow.querySelector('.content');
    this.shadowRoot = shadow;
  }

  _update() {
    const entityId = this._config.entity;
    const state = this._hass.states[entityId];
    if (!state) {
      this.content.innerHTML = `<p>Entity ${entityId} not found</p>`;
      return;
    }

    const attr = state.attributes || {};
    const inSeason = state.state === "in_season";

    this.content.innerHTML = `
      ${attr.photo_url ? `<img src="${attr.photo_url}" class="photo" alt="${attr.common_name || ''}">` : ''}
      <div class="common-name">${attr.common_name || state.attributes.friendly_name || entityId}</div>
      <div class="scientific">${attr.scientific_name || ''}</div>
      <div class="badge ${inSeason ? 'in-season' : 'out-of-season'}">
        ${inSeason ? 'In Season' : 'Out of Season'}
      </div>
      <small>${attr.observation_count ? attr.observation_count + ' observations this month' : ''}</small>
    `;
  }

  getCardSize() {
    return 4;
  }
}

// ==================== GRID CARD ====================
class ForageSeasonGridCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._grid) this._build();
    this._render();
  }

  _build() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        h1 { margin: 0 0 16px 0; font-size: 1.6em; }
        .grid {
          display: grid;
          grid-template-columns: repeat(var(--columns, 3), 1fr);
          gap: 12px;
        }
        .item {
          background: var(--card-background-color, #1e1e1e);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: var(--ha-card-box-shadow, none);
        }
        .item:hover { transform: translateY(-4px); }
        .item:active { transform: scale(0.96); }
        .photo { width: 100%; aspect-ratio: 1.4 / 1; object-fit: cover; }
        .info {
          padding: 10px;
        }
        .common-name {
          font-weight: 600;
          font-size: 1.05em;
          line-height: 1.3;
        }
        .scientific {
          font-size: 0.85em;
          font-style: italic;
          color: var(--secondary-text-color);
        }
      </style>
      <div class="header"><h1></h1></div>
      <div class="grid"></div>
    `;

    this._header = shadow.querySelector('h1');
    this._grid = shadow.querySelector('.grid');
    this.shadowRoot = shadow;
  }

  _render() {
    if (!this._grid) return;

    const config = this._config;
    this._header.textContent = config.title || "Forageables";

    const columns = config.columns || 3;
    this._grid.style.setProperty('--columns', columns);

    this._grid.innerHTML = '';

    // Get all sensors that are likely forageables
    const forageEntities = Object.keys(this._hass.states).filter(eid => 
      eid.startsWith('sensor.') && 
      this._hass.states[eid].attributes.common_name
    );

    forageEntities.forEach(entityId => {
      const state = this._hass.states[entityId];
      if (!state) return;

      const attr = state.attributes;
      const item = document.createElement('div');
      item.className = 'item';
      item.dataset.entity = entityId;

      item.innerHTML = `
        ${attr.photo_url ? `<img src="${attr.photo_url}" class="photo">` : '<div style="height:140px;background:#333;"></div>'}
        <div class="info">
          <div class="common-name">${attr.common_name || ''}</div>
          <div class="scientific">${attr.scientific_name || ''}</div>
        </div>
      `;

      // Generic Tap Action
      item.addEventListener('click', () => {
        this._handleAction(config.tap_action || { action: "more-info" }, entityId);
      });

      // Hold Action
      let timer;
      item.addEventListener('mousedown', (e) => {
        timer = setTimeout(() => {
          this._handleAction(config.hold_action || { action: "more-info" }, entityId);
        }, 550);
      });
      item.addEventListener('mouseup', () => clearTimeout(timer));
      item.addEventListener('mouseleave', () => clearTimeout(timer));

      this._grid.appendChild(item);
    });
  }

  _handleAction(actionConfig, entityId) {
    if (!actionConfig || actionConfig.action === "none") return;

    switch (actionConfig.action) {
      case "more-info":
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: { entityId: entityId },
          bubbles: true,
          composed: true
        }));
        break;

      case "call-service":
        if (actionConfig.service) {
          const [domain, service] = actionConfig.service.split(".");
          this._hass.callService(domain, service, {
            ...actionConfig.data,
            entity_id: actionConfig.target?.entity_id || entityId
          });
        }
        break;

      case "navigate":
        if (actionConfig.navigation_path) {
          window.history.pushState(null, "", actionConfig.navigation_path);
          window.dispatchEvent(new CustomEvent("location-changed"));
        }
        break;

      case "url":
        if (actionConfig.url) window.open(actionConfig.url, "_blank");
        break;

      default:
        this.dispatchEvent(new CustomEvent("hass-more-info", {
          detail: { entityId: entityId },
          bubbles: true,
          composed: true
        }));
    }
  }
}

// Register both cards
customElements.define("forage-season-card", ForageSeasonCard);
customElements.define("forage-season-grid-card", ForageSeasonGridCard);