function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function parseIntOrDefault(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const TOC_COLOURS = {
  'Southern': '#00A651',
  'Southeastern': '#00AFEB',
  'South Western Railway': '#0F4E8B',
  'SWR': '#0F4E8B',
  'Thameslink': '#D4006E',
  'Great Northern': '#000000',
  'London Overground': '#EE7C0E',
  'Gatwick Express': '#E32017',
  'Great Western Railway': '#004B37',
  'GWR': '#004B37',
  'c2c': '#C4007A',
  'Greater Anglia': '#E41F1F',
  'Chiltern Railways': '#00AEEF',
  'CrossCountry': '#520D30',
  'East Midlands Railway': '#FF6600',
  'EMR': '#FF6600',
  'LNER': '#E32017',
  'Northern': '#0066B3',
  'ScotRail': '#2A5C99',
  'TransPennine Express': '#00B8F0',
  'TPE': '#00B8F0',
  'Avanti West Coast': '#E32017',
  'West Midlands Railway': '#F37021',
  'Elizabeth line': '#6950A1',
};

const TOC_ABBREVIATIONS = {
  'Southern': 'SN',
  'Southeastern': 'SE',
  'South Western Railway': 'SWR',
  'Thameslink': 'TL',
  'Great Northern': 'GN',
  'London Overground': 'LO',
  'Gatwick Express': 'GX',
  'Great Western Railway': 'GWR',
  'c2c': 'C2C',
  'Greater Anglia': 'GA',
  'Chiltern Railways': 'CH',
  'CrossCountry': 'XC',
  'East Midlands Railway': 'EMR',
  'LNER': 'LNER',
  'Northern': 'NT',
  'ScotRail': 'SR',
  'TransPennine Express': 'TPE',
  'Avanti West Coast': 'AW',
  'West Midlands Railway': 'WMR',
  'Elizabeth line': 'EL',
};

const getTocColour = (operator) => TOC_COLOURS[operator] || '#666666';
const getTocAbbrev = (operator) => TOC_ABBREVIATIONS[operator] || (operator || '').substring(0, 3).toUpperCase();

const CRITICAL_RED = '#FF3B30';

function getSeverity(dep, tocColour) {
  const delay = dep.delay_minutes || 0;

  if (dep.is_cancelled) {
    return {
      accent: CRITICAL_RED,
      timeColor: CRITICAL_RED,
      pillBg: CRITICAL_RED,
      pillColor: '#fff',
      pillText: 'Cancelled',
      strike: true,
      rowTint: 'rgba(255,59,48,0.08)',
    };
  }

  if (dep.is_delayed && delay > 5) {
    return {
      accent: CRITICAL_RED,
      timeColor: CRITICAL_RED,
      pillBg: CRITICAL_RED,
      pillColor: '#fff',
      pillText: `+${delay}m late`,
      strike: false,
      rowTint: 'rgba(255,59,48,0.06)',
    };
  }

  if (dep.is_delayed) {
    return {
      accent: tocColour,
      timeColor: tocColour,
      pillBg: '#FF9500',
      pillColor: '#fff',
      pillText: `+${delay}m`,
      strike: false,
      rowTint: null,
    };
  }

  return {
    accent: tocColour,
    timeColor: tocColour,
    pillBg: 'transparent',
    pillColor: 'var(--secondary-text-color)',
    pillText: 'On time',
    strike: false,
    rowTint: null,
    pillBorder: true,
  };
}

const CARD_STYLES = `
  .railboard-root {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
  }
  .railboard-header {
    padding: 0 0 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.08));
  }
  .railboard-title {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--primary-text-color);
  }
  .railboard-subtitle {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .railboard-empty {
    text-align: center;
    padding: 36px 16px;
    color: var(--secondary-text-color);
  }
  .railboard-empty-icon { font-size: 32px; opacity: .35; }
  .railboard-empty-text { margin-top: 8px; font-size: 13px; }
  .railboard-list {
    border-radius: 10px;
    overflow: hidden;
    background: var(--card-background-color, var(--ha-card-background, #fff));
  }
  .railboard-list > *:last-child { border-bottom: none; }
  .railboard-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px;
    border-left: 3px solid transparent;
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.06));
  }
  .railboard-row--expandable { cursor: pointer; }
  .railboard-chevron {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--secondary-text-color);
    transition: transform .15s ease;
  }
  .railboard-chevron--open { transform: rotate(90deg); }
  .railboard-time-col { flex: 0 0 52px; text-align: center; }
  .railboard-time {
    font-size: 16px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.15;
  }
  .railboard-plat {
    font-size: 10px;
    color: var(--secondary-text-color);
    margin-top: 1px;
    text-transform: uppercase;
    letter-spacing: .02em;
  }
  .railboard-main { flex: 1; min-width: 0; }
  .railboard-line { display: flex; align-items: center; gap: 6px; }
  .railboard-dest {
    font-size: 14px;
    font-weight: 600;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .railboard-badge {
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .3px;
    padding: 2px 6px;
    border-radius: 5px;
    color: #fff;
  }
  .railboard-subline {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 1px;
  }
  .railboard-arrival {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--secondary-text-color);
    font-variant-numeric: tabular-nums;
  }
  .railboard-status { flex: 0 0 auto; }
  .railboard-pill {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .2px;
    padding: 4px 9px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .railboard-expand {
    padding: 8px 14px 10px 66px;
    font-size: 11px;
    color: var(--secondary-text-color);
    border-bottom: 1px solid var(--divider-color, rgba(0,0,0,.06));
    background: var(--secondary-background-color, rgba(127,127,127,0.04));
  }
  .railboard-expand-state { font-style: italic; }
  .railboard-stop {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 0;
  }
  .railboard-stop-time {
    flex-shrink: 0;
    width: 38px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
  }
  .railboard-stop-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .railboard-stop-plat { flex-shrink: 0; opacity: .8; }
`;

class RailboardCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("railboard-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      title: "",
      show_platforms: true,
      show_status: true,
      show_calling_points: true,
      show_operator_badge: true,
      show_arrival_time: true,
      max_departures: 10,
      min_walk_time: 0,
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = {
      entity: config.entity,
      title: config.title || null,
      show_platforms: config.show_platforms !== false,
      show_status: config.show_status !== false,
      show_calling_points: config.show_calling_points !== false,
      show_operator_badge: config.show_operator_badge !== false,
      show_arrival_time: config.show_arrival_time !== false,
      max_departures: Number.isFinite(config.max_departures) ? config.max_departures : 10,
      min_walk_time: Number.isFinite(config.min_walk_time) ? config.min_walk_time : 0,
    };
  }

  set hass(hass) {
    this._hass = hass;

    if (!this.content) {
      this._expandedServices = new Set();
      this._callingPointsCache = new Map();
      this._loadingServices = new Set();

      this.innerHTML = `<ha-card><style>${CARD_STYLES}</style><div class="card-content railboard-root"></div></ha-card>`;
      this.content = this.querySelector('.card-content');

      this.content.addEventListener('click', (e) => {
        const row = e.target.closest('.railboard-row--expandable');
        if (!row) return;
        const uid = row.dataset.serviceUid;
        if (!uid) return;
        this._toggleCallingPoints(uid);
      });
    }

    const entity = hass.states[this.config.entity];
    if (!entity) {
      this.content.innerHTML = `<p>Entity ${escapeHtml(this.config.entity)} not found</p>`;
      return;
    }

    this.renderCard(entity);
  }

  renderCard(entity) {
    this._lastEntity = entity;
    const departures = entity.attributes.departures || [];

    let html = '';

    if (this.config.title) {
      html += `
        <div class="railboard-header">
          <div class="railboard-title">${escapeHtml(this.config.title)}</div>
          <div class="railboard-subtitle">${escapeHtml(entity.state)} departures</div>
        </div>
      `;
    }

    const now = new Date();
    const filteredDeps = departures.filter(dep => {
      if (!this.config.min_walk_time) return true;
      if (!dep.expected) return false;
      const [h, m] = dep.expected.split(':').map(Number);
      const depTime = new Date();
      depTime.setHours(h, m, 0, 0);
      const diffMinutes = Math.round((depTime - now) / 60000);
      return diffMinutes >= this.config.min_walk_time;
    });

    if (filteredDeps.length === 0) {
      html += `
        <div class="railboard-empty">
          <div class="railboard-empty-icon">🚂</div>
          <div class="railboard-empty-text">No departures available</div>
        </div>
      `;
    } else {
      const maxDeps = Math.min(filteredDeps.length, this.config.max_departures);

      html += `<div class="railboard-list">`;

      for (let i = 0; i < maxDeps; i++) {
        const dep = filteredDeps[i];
        const tocColour = getTocColour(dep.operator);
        const tocAbbrev = escapeHtml(getTocAbbrev(dep.operator));
        const severity = getSeverity(dep, tocColour);

        let arrivalText = '';
        if (this.config.show_arrival_time && dep.arrival_time) {
          const durationText = Number.isFinite(dep.duration_minutes) ? ` · ${dep.duration_minutes}m` : '';
          arrivalText = `${escapeHtml(dep.arrival_time)}${durationText}`;
        }

        const sublineHtml = arrivalText
          ? `<div class="railboard-subline"><span class="railboard-arrival">→ ${arrivalText}</span></div>`
          : '';

        const isExpandable = this.config.show_calling_points && !!dep.service_uid;
        const isExpanded = isExpandable && this._expandedServices.has(dep.service_uid);
        const chevronHtml = isExpandable
          ? `<span class="railboard-chevron${isExpanded ? ' railboard-chevron--open' : ''}">›</span>`
          : '';
        const expandHtml = isExpanded ? this._renderExpandPanel(dep.service_uid) : '';

        const badgeHtml = this.config.show_operator_badge
          ? `<span class="railboard-badge" style="background: ${tocColour};">${tocAbbrev}</span>`
          : '';

        const platformHtml = this.config.show_platforms
          ? `<div class="railboard-plat">Plat ${escapeHtml(dep.platform || '—')}</div>`
          : '';

        const statusHtml = this.config.show_status
          ? `<div class="railboard-status">
               <span class="railboard-pill" style="background: ${severity.pillBg}; color: ${severity.pillColor};${severity.pillBorder ? ' border: 1px solid var(--divider-color, rgba(0,0,0,.15));' : ''}">${escapeHtml(severity.pillText)}</span>
             </div>`
          : '';

        const strikeStyle = severity.strike ? 'text-decoration: line-through; opacity: .6;' : '';

        html += `
          <div class="railboard-row${isExpandable ? ' railboard-row--expandable' : ''}" style="border-left-color: ${severity.accent};${severity.rowTint ? ` background: ${severity.rowTint};` : ''}"${isExpandable ? ` data-service-uid="${escapeHtml(dep.service_uid)}"` : ''}>
            <div class="railboard-time-col">
              <div class="railboard-time" style="color: ${severity.timeColor}; ${strikeStyle}">${escapeHtml(dep.expected)}</div>
              ${platformHtml}
            </div>
            <div class="railboard-main">
              <div class="railboard-line">
                <span class="railboard-dest" style="${strikeStyle}">${escapeHtml(dep.destination)}</span>
                ${badgeHtml}
              </div>
              ${sublineHtml}
            </div>
            ${statusHtml}
            ${chevronHtml}
          </div>
          ${expandHtml}
        `;
      }

      html += `</div>`;
    }

    this.content.innerHTML = html;
  }

  _renderExpandPanel(uid) {
    if (this._loadingServices.has(uid)) {
      return `<div class="railboard-expand railboard-expand-state">Loading stops…</div>`;
    }

    const cached = this._callingPointsCache.get(uid);
    if (!cached) {
      return `<div class="railboard-expand railboard-expand-state">Loading stops…</div>`;
    }
    if (cached.error) {
      return `<div class="railboard-expand railboard-expand-state">Couldn't load stops</div>`;
    }
    if (!cached.points || cached.points.length === 0) {
      return `<div class="railboard-expand railboard-expand-state">No intermediate stops</div>`;
    }

    const stopsHtml = cached.points.map(point => {
      const time = escapeHtml(point.expected_arrival || point.scheduled_arrival || point.expected_departure || point.scheduled_departure || '');
      const name = escapeHtml(point.name || '');
      const plat = point.platform ? `Plat ${escapeHtml(point.platform)}` : '';
      const strike = point.is_cancelled ? 'text-decoration: line-through; opacity: .6;' : '';
      return `
        <div class="railboard-stop" style="${strike}">
          <span class="railboard-stop-time">${time}</span>
          <span class="railboard-stop-name">${name}</span>
          <span class="railboard-stop-plat">${plat}</span>
        </div>
      `;
    }).join('');

    return `<div class="railboard-expand">${stopsHtml}</div>`;
  }

  async _toggleCallingPoints(uid) {
    if (this._expandedServices.has(uid)) {
      this._expandedServices.delete(uid);
      this._rerender();
      return;
    }

    this._expandedServices.add(uid);

    if (this._callingPointsCache.has(uid)) {
      this._rerender();
      return;
    }

    this._loadingServices.add(uid);
    this._rerender();

    try {
      const result = await this._hass.callService('railboard', 'get_service_detail', { service_uid: uid }, undefined, true, true);
      const payload = result && result.response ? result.response : result;
      const points = payload && Array.isArray(payload.calling_points) ? payload.calling_points : [];
      this._callingPointsCache.set(uid, { points });
    } catch (err) {
      this._callingPointsCache.set(uid, { error: true });
    } finally {
      this._loadingServices.delete(uid);
      this._rerender();
    }
  }

  _rerender() {
    if (this._lastEntity) this.renderCard(this._lastEntity);
  }

  getCardSize() { return 3; }
}

class RailboardCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (!this._initialized) {
      this._initialized = true;
      this.render();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._initialized) this.updateEntityPicker();
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', { bubbles: true, composed: true });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    this.innerHTML = `
      <div class="card-config">
        <div class="entity-row">
          <label>Entity (Required)</label>
          <select id="entity-picker">
            <option value="">Select entity...</option>
          </select>
        </div>
        <div class="input-row">
          <label>Title (Optional)</label>
          <input type="text" id="title-input" value="${escapeHtml(this._config.title || '')}" placeholder="e.g., Crystal Palace" />
        </div>
        <div class="input-row">
          <label>Max Departures</label>
          <input type="number" id="max-input" min="1" max="50" value="${escapeHtml(this._config.max_departures || 10)}" />
        </div>
        <div class="input-row">
          <label>Min Walking Time (minutes)</label>
          <input type="number" id="walk-input" min="0" max="60" value="${escapeHtml(this._config.min_walk_time || 0)}" />
        </div>
        <div class="switch-row">
          <label>Show Platforms</label>
          <input type="checkbox" id="platforms-switch" ${this._config.show_platforms !== false ? 'checked' : ''} />
        </div>
        <div class="switch-row">
          <label>Show Status</label>
          <input type="checkbox" id="status-switch" ${this._config.show_status !== false ? 'checked' : ''} />
        </div>
        <div class="switch-row">
          <label>Calling Points (tap a departure to expand)</label>
          <input type="checkbox" id="calling-switch" ${this._config.show_calling_points !== false ? 'checked' : ''} />
        </div>
        <div class="switch-row">
          <label>Show Operator Badge</label>
          <input type="checkbox" id="badge-switch" ${this._config.show_operator_badge !== false ? 'checked' : ''} />
        </div>
        <div class="switch-row">
          <label>Show Arrival Time</label>
          <input type="checkbox" id="arrival-switch" ${this._config.show_arrival_time !== false ? 'checked' : ''} />
        </div>
      </div>
      <style>
        .card-config { padding: 16px; }
        .entity-row, .input-row, .switch-row { display:flex; align-items:center; margin-bottom:12px; }
        label { flex:1; font-weight:500; color: var(--primary-text-color); }
        select, input[type="text"], input[type="number"] { flex:2; padding:8px; border:1px solid var(--divider-color); border-radius:4px; background: var(--card-background-color); color: var(--primary-text-color); }
        input[type="checkbox"] { width:40px; height:20px; cursor:pointer; }
      </style>
    `;
    this.setupListeners();
    this.updateEntityPicker();
  }

  updateEntityPicker() {
    if (!this._hass) return;
    const select = this.querySelector('#entity-picker');
    if (!select) return;

    const entities = Object.keys(this._hass.states)
      .filter(eid => eid.startsWith('sensor.railboard_departures'))
      .sort();

    select.innerHTML = '<option value="">Select entity...</option>' +
      entities.map(eid => `<option value="${escapeHtml(eid)}" ${eid === this._config.entity ? 'selected' : ''}>${escapeHtml(eid)}</option>`).join('');
  }

  setupListeners() {
    const entityPicker = this.querySelector('#entity-picker');
    const titleInput = this.querySelector('#title-input');
    const maxInput = this.querySelector('#max-input');
    const walkInput = this.querySelector('#walk-input');
    const platformsSwitch = this.querySelector('#platforms-switch');
    const statusSwitch = this.querySelector('#status-switch');
    const callingSwitch = this.querySelector('#calling-switch');
    const badgeSwitch = this.querySelector('#badge-switch');
    const arrivalSwitch = this.querySelector('#arrival-switch');

    if (entityPicker) entityPicker.addEventListener('change', e => { this._config = { ...this._config, entity: e.target.value }; this.configChanged(this._config); });
    if (titleInput) titleInput.addEventListener('change', e => { this._config = { ...this._config, title: e.target.value }; this.configChanged(this._config); });
    if (maxInput) maxInput.addEventListener('change', e => { this._config = { ...this._config, max_departures: parseIntOrDefault(e.target.value, this._config.max_departures || 10) }; this.configChanged(this._config); });
    if (walkInput) walkInput.addEventListener('change', e => { this._config = { ...this._config, min_walk_time: parseIntOrDefault(e.target.value, this._config.min_walk_time || 0) }; this.configChanged(this._config); });
    if (platformsSwitch) platformsSwitch.addEventListener('change', e => { this._config = { ...this._config, show_platforms: e.target.checked }; this.configChanged(this._config); });
    if (statusSwitch) statusSwitch.addEventListener('change', e => { this._config = { ...this._config, show_status: e.target.checked }; this.configChanged(this._config); });
    if (callingSwitch) callingSwitch.addEventListener('change', e => { this._config = { ...this._config, show_calling_points: e.target.checked }; this.configChanged(this._config); });
    if (badgeSwitch) badgeSwitch.addEventListener('change', e => { this._config = { ...this._config, show_operator_badge: e.target.checked }; this.configChanged(this._config); });
    if (arrivalSwitch) arrivalSwitch.addEventListener('change', e => { this._config = { ...this._config, show_arrival_time: e.target.checked }; this.configChanged(this._config); });
  }
}

customElements.define('railboard-card', RailboardCard);
customElements.define('railboard-card-editor', RailboardCardEditor);
console.log('RailboardCard JS loaded');
