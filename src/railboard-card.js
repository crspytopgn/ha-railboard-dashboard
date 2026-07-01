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

function formatClockTime(isoOrTime) {
  if (!isoOrTime) return '';
  const d = new Date(isoOrTime);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
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
      tier: 'critical',
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
      tier: 'critical',
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
      tier: 'minor',
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
    tier: 'ontime',
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
  .railboard-alerts {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .railboard-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
  }
  .railboard-alert--leave { background: #34C759; }
  .railboard-alert--disruption { background: #FF3B30; }
  .railboard-footer {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--divider-color, rgba(0,0,0,.08));
    font-size: 11px;
    color: var(--secondary-text-color);
    text-align: center;
  }
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

  /* Dot Matrix theme: retro amber LED departure board */
  .railboard-theme-dot-matrix {
    font-family: 'Courier New', Courier, monospace;
    text-transform: uppercase;
    letter-spacing: .03em;
    background: #000;
  }
  .railboard-theme-dot-matrix .railboard-list {
    background: #000 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  .railboard-theme-dot-matrix .railboard-row {
    border-left-width: 0 !important;
    border-radius: 0 !important;
    border-bottom-color: #3a2a00 !important;
    background: transparent !important;
  }
  .railboard-theme-dot-matrix .railboard-header { border-bottom-color: #3a2a00 !important; }
  .railboard-theme-dot-matrix .railboard-expand {
    background: transparent !important;
    border-bottom-color: #3a2a00 !important;
  }
  .railboard-theme-dot-matrix .railboard-footer { border-top-color: #3a2a00 !important; }
  .railboard-theme-dot-matrix .railboard-badge {
    background: transparent !important;
    color: #FFB000 !important;
    border: 1px solid #FFB000;
    border-radius: 0 !important;
  }
  .railboard-theme-dot-matrix .railboard-pill,
  .railboard-theme-dot-matrix .railboard-alert {
    background: transparent !important;
    border: 1px solid currentColor !important;
    border-radius: 0 !important;
  }
  /* Base amber colour (source order matters: this must precede the --critical
     override below so equal-specificity cascade lets critical win) */
  .railboard-theme-dot-matrix .railboard-time,
  .railboard-theme-dot-matrix .railboard-pill,
  .railboard-theme-dot-matrix .railboard-alert--leave,
  .railboard-theme-dot-matrix .railboard-title,
  .railboard-theme-dot-matrix .railboard-subtitle,
  .railboard-theme-dot-matrix .railboard-plat,
  .railboard-theme-dot-matrix .railboard-dest,
  .railboard-theme-dot-matrix .railboard-arrival,
  .railboard-theme-dot-matrix .railboard-empty,
  .railboard-theme-dot-matrix .railboard-chevron,
  .railboard-theme-dot-matrix .railboard-footer,
  .railboard-theme-dot-matrix .railboard-expand,
  .railboard-theme-dot-matrix .railboard-stop-time {
    color: #FFB000 !important;
    text-shadow: 0 0 4px rgba(255, 176, 0, .5);
  }
  .railboard-theme-dot-matrix .railboard-time--critical,
  .railboard-theme-dot-matrix .railboard-pill--critical,
  .railboard-theme-dot-matrix .railboard-alert--disruption {
    color: #FF3B30 !important;
    text-shadow: 0 0 4px rgba(255, 59, 48, .5);
  }
`;

class RailboardCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("railboard-card-editor");
  }

  static getStubConfig() {
    return {
      entity: "",
      title: "",
      board_style: "modern",
      show_platforms: true,
      show_status: true,
      show_calling_points: true,
      show_operator_badge: true,
      show_arrival_time: true,
      max_departures: 10,
      min_walk_time: 0,
      leave_now_entity: "",
      disruption_entity: "",
      punctuality_entity: "",
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }

    this.config = {
      entity: config.entity,
      title: config.title || null,
      board_style: config.board_style === 'dot_matrix' ? 'dot_matrix' : 'modern',
      show_platforms: config.show_platforms !== false,
      show_status: config.show_status !== false,
      show_calling_points: config.show_calling_points !== false,
      show_operator_badge: config.show_operator_badge !== false,
      show_arrival_time: config.show_arrival_time !== false,
      max_departures: Number.isFinite(config.max_departures) ? config.max_departures : 10,
      min_walk_time: Number.isFinite(config.min_walk_time) ? config.min_walk_time : 0,
      leave_now_entity: config.leave_now_entity || null,
      disruption_entity: config.disruption_entity || null,
      punctuality_entity: config.punctuality_entity || null,
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

    const themeClass = this.config.board_style === 'dot_matrix' ? 'railboard-theme-dot-matrix' : 'railboard-theme-modern';
    this.content.className = `card-content railboard-root ${themeClass}`;

    const isBusMode = Array.isArray(entity.attributes.arrivals);
    const items = isBusMode ? (entity.attributes.arrivals || []) : (entity.attributes.departures || []);

    let html = '';

    if (this.config.title) {
      const subtitle = isBusMode
        ? (Number.isFinite(Number(entity.state)) ? `Next bus in ${escapeHtml(entity.state)} min` : 'Bus arrivals')
        : `${escapeHtml(entity.state)} departures`;
      html += `
        <div class="railboard-header">
          <div class="railboard-title">${escapeHtml(this.config.title)}</div>
          <div class="railboard-subtitle">${subtitle}</div>
        </div>
      `;
    }

    html += this._renderAlerts();

    const now = new Date();
    const filteredItems = items.filter(item => {
      if (!this.config.min_walk_time) return true;
      if (isBusMode) {
        return Number.isFinite(item.minutes) && item.minutes >= this.config.min_walk_time;
      }
      if (!item.expected) return false;
      const [h, m] = item.expected.split(':').map(Number);
      const depTime = new Date();
      depTime.setHours(h, m, 0, 0);
      const diffMinutes = Math.round((depTime - now) / 60000);
      return diffMinutes >= this.config.min_walk_time;
    });

    if (filteredItems.length === 0) {
      const emptyText = isBusMode ? 'No buses due' : 'No departures available';
      html += `
        <div class="railboard-empty">
          <div class="railboard-empty-icon">${isBusMode ? '🚌' : '🚂'}</div>
          <div class="railboard-empty-text">${emptyText}</div>
        </div>
      `;
    } else {
      const maxItems = Math.min(filteredItems.length, this.config.max_departures);

      html += `<div class="railboard-list">`;
      for (let i = 0; i < maxItems; i++) {
        html += isBusMode ? this._renderBusRow(filteredItems[i]) : this._renderRailRow(filteredItems[i]);
      }
      html += `</div>`;
    }

    html += this._renderFooter();

    this.content.innerHTML = html;
  }

  _getEntityState(entityId) {
    if (!entityId || !this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _renderAlerts() {
    let html = '';

    const leaveNow = this._getEntityState(this.config.leave_now_entity);
    if (leaveNow && leaveNow.state === 'on') {
      const minutes = Number.isFinite(leaveNow.attributes.minutes_until_departure)
        ? leaveNow.attributes.minutes_until_departure
        : leaveNow.attributes.minutes_until_arrival;
      const minutesText = Number.isFinite(minutes) ? ` — ${escapeHtml(minutes)} min` : '';
      html += `<div class="railboard-alert railboard-alert--leave">🚶 Leave now${minutesText}</div>`;
    }

    const disruption = this._getEntityState(this.config.disruption_entity);
    if (disruption && disruption.state === 'on') {
      const count = disruption.attributes.disrupted_count;
      const countText = Number.isFinite(count) ? `${count} ` : '';
      const label = count === 1 ? 'service' : 'services';
      html += `<div class="railboard-alert railboard-alert--disruption">⚠️ ${escapeHtml(countText)}${label} disrupted</div>`;
    }

    return html ? `<div class="railboard-alerts">${html}</div>` : '';
  }

  _renderFooter() {
    const punctuality = this._getEntityState(this.config.punctuality_entity);
    if (!punctuality) return '';

    const pct = parseFloat(punctuality.state);
    if (!Number.isFinite(pct)) return '';

    return `<div class="railboard-footer">📊 ${escapeHtml(Math.round(pct))}% on time today</div>`;
  }

  _renderRailRow(dep) {
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
           <span class="railboard-pill railboard-pill--${severity.tier}" style="background: ${severity.pillBg}; color: ${severity.pillColor};${severity.pillBorder ? ' border: 1px solid var(--divider-color, rgba(0,0,0,.15));' : ''}">${escapeHtml(severity.pillText)}</span>
         </div>`
      : '';

    const strikeStyle = severity.strike ? 'text-decoration: line-through; opacity: .6;' : '';

    return `
      <div class="railboard-row${isExpandable ? ' railboard-row--expandable' : ''}" style="border-left-color: ${severity.accent};${severity.rowTint ? ` background: ${severity.rowTint};` : ''}"${isExpandable ? ` data-service-uid="${escapeHtml(dep.service_uid)}"` : ''}>
        <div class="railboard-time-col">
          <div class="railboard-time railboard-time--${severity.tier}" style="color: ${severity.timeColor}; ${strikeStyle}">${escapeHtml(dep.expected)}</div>
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

  _renderBusRow(item) {
    const BUS_RED = '#DC241F';
    const minutes = Number.isFinite(item.minutes) ? item.minutes : null;
    const isDue = minutes !== null && minutes <= 1;
    const etaText = minutes === null ? '—' : (minutes <= 0 ? 'DUE' : `${minutes} min`);
    const timeStyle = isDue ? `color: ${CRITICAL_RED}; font-weight: 800;` : `color: ${BUS_RED};`;

    const clockTime = this.config.show_arrival_time ? formatClockTime(item.expected_arrival) : '';

    const badgeHtml = this.config.show_operator_badge
      ? `<span class="railboard-badge" style="background: ${BUS_RED};">${escapeHtml(item.line || '')}</span>`
      : '';

    const platformHtml = this.config.show_platforms && item.platform
      ? `<div class="railboard-status"><span class="railboard-pill" style="color: var(--secondary-text-color); border: 1px solid var(--divider-color, rgba(0,0,0,.15));">${escapeHtml(item.platform)}</span></div>`
      : '';

    return `
      <div class="railboard-row" style="border-left-color: ${BUS_RED};">
        <div class="railboard-time-col">
          <div class="railboard-time${isDue ? ' railboard-time--critical' : ''}" style="${timeStyle}">${escapeHtml(etaText)}</div>
          ${clockTime ? `<div class="railboard-plat">${escapeHtml(clockTime)}</div>` : ''}
        </div>
        <div class="railboard-main">
          <div class="railboard-line">
            <span class="railboard-dest">${escapeHtml(item.destination || item.towards || '')}</span>
            ${badgeHtml}
          </div>
        </div>
        ${platformHtml}
      </div>
    `;
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
        <div class="entity-row">
          <label>Leave Now Sensor (Optional)</label>
          <select id="leave-now-picker">
            <option value="">None</option>
          </select>
        </div>
        <div class="entity-row">
          <label>Disruption Sensor (Optional)</label>
          <select id="disruption-picker">
            <option value="">None</option>
          </select>
        </div>
        <div class="entity-row">
          <label>Punctuality Sensor (Optional)</label>
          <select id="punctuality-picker">
            <option value="">None</option>
          </select>
        </div>
        <div class="input-row">
          <label>Title (Optional)</label>
          <input type="text" id="title-input" value="${escapeHtml(this._config.title || '')}" placeholder="e.g., Crystal Palace" />
        </div>
        <div class="input-row">
          <label>Board Style</label>
          <select id="style-picker">
            <option value="modern" ${this._config.board_style !== 'dot_matrix' ? 'selected' : ''}>Modern</option>
            <option value="dot_matrix" ${this._config.board_style === 'dot_matrix' ? 'selected' : ''}>Dot Matrix (retro LED)</option>
          </select>
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
          <label>Show Operator / Line Badge</label>
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
    const allEntities = Object.keys(this._hass.states);

    this._populateSelect(
      '#entity-picker',
      allEntities.filter(eid => eid.startsWith('sensor.railboard_departures') || eid.startsWith('sensor.railboard_bus_')),
      this._config.entity,
      'Select entity...'
    );
    this._populateSelect(
      '#leave-now-picker',
      allEntities.filter(eid => eid.startsWith('binary_sensor.railboard_leave_now_') || eid.startsWith('binary_sensor.railboard_bus_leave_now_')),
      this._config.leave_now_entity,
      'None'
    );
    this._populateSelect(
      '#disruption-picker',
      allEntities.filter(eid => eid.startsWith('binary_sensor.railboard_disruption_') || eid.startsWith('binary_sensor.railboard_bus_disruption_')),
      this._config.disruption_entity,
      'None'
    );
    this._populateSelect(
      '#punctuality-picker',
      allEntities.filter(eid => eid.startsWith('sensor.railboard_punctuality_')),
      this._config.punctuality_entity,
      'None'
    );
  }

  _populateSelect(selector, entities, currentValue, noneLabel) {
    const select = this.querySelector(selector);
    if (!select) return;

    const sorted = entities.slice().sort();
    select.innerHTML = `<option value="">${escapeHtml(noneLabel)}</option>` +
      sorted.map(eid => `<option value="${escapeHtml(eid)}" ${eid === currentValue ? 'selected' : ''}>${escapeHtml(eid)}</option>`).join('');
  }

  setupListeners() {
    const entityPicker = this.querySelector('#entity-picker');
    const leaveNowPicker = this.querySelector('#leave-now-picker');
    const disruptionPicker = this.querySelector('#disruption-picker');
    const punctualityPicker = this.querySelector('#punctuality-picker');
    const titleInput = this.querySelector('#title-input');
    const stylePicker = this.querySelector('#style-picker');
    const maxInput = this.querySelector('#max-input');
    const walkInput = this.querySelector('#walk-input');
    const platformsSwitch = this.querySelector('#platforms-switch');
    const statusSwitch = this.querySelector('#status-switch');
    const callingSwitch = this.querySelector('#calling-switch');
    const badgeSwitch = this.querySelector('#badge-switch');
    const arrivalSwitch = this.querySelector('#arrival-switch');

    if (entityPicker) entityPicker.addEventListener('change', e => { this._config = { ...this._config, entity: e.target.value }; this.configChanged(this._config); });
    if (leaveNowPicker) leaveNowPicker.addEventListener('change', e => { this._config = { ...this._config, leave_now_entity: e.target.value }; this.configChanged(this._config); });
    if (disruptionPicker) disruptionPicker.addEventListener('change', e => { this._config = { ...this._config, disruption_entity: e.target.value }; this.configChanged(this._config); });
    if (punctualityPicker) punctualityPicker.addEventListener('change', e => { this._config = { ...this._config, punctuality_entity: e.target.value }; this.configChanged(this._config); });
    if (titleInput) titleInput.addEventListener('change', e => { this._config = { ...this._config, title: e.target.value }; this.configChanged(this._config); });
    if (stylePicker) stylePicker.addEventListener('change', e => { this._config = { ...this._config, board_style: e.target.value }; this.configChanged(this._config); });
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
