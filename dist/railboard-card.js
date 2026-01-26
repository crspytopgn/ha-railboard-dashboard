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
      max_departures: 10,
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
      max_departures: config.max_departures || 10,
    };
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content"></div>
        </ha-card>
      `;
      this.content = this.querySelector('.card-content');
    }

    const entity = hass.states[this.config.entity];
    if (!entity) {
      this.content.innerHTML = `<p>Entity ${this.config.entity} not found</p>`;
      return;
    }

    this.renderCard(entity);
  }

  renderCard(entity) {
    const departures = entity.attributes.departures || [];
    
    const tocColours = {
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

    const tocAbbreviations = {
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

    const getTocColour = (operator) => tocColours[operator] || '#666666';
    const getTocAbbrev = (operator) => tocAbbreviations[operator] || operator.substring(0, 3).toUpperCase();

    let html = '';
    
    if (this.config.title) {
      html += `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px 20px; margin: -16px -16px 16px -16px; border-radius: var(--ha-card-border-radius, 12px) var(--ha-card-border-radius, 12px) 0 0; color: white;">
          <div style="font-size: 28px; font-weight: 700;">${this.config.title}</div>
          <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">${entity.state} departures</div>
        </div>
      `;
    }

    if (departures.length === 0) {
      html += `
        <div style="text-align: center; padding: 60px 20px; color: var(--secondary-text-color);">
          <div style="font-size: 48px; opacity: 0.3;">🚂</div>
          <div style="margin-top: 12px;">No departures available</div>
        </div>
      `;
    } else {
      const maxDeps = Math.min(departures.length, this.config.max_departures);
      
      for (let i = 0; i < maxDeps; i++) {
        const dep = departures[i];
        const tocColour = getTocColour(dep.operator);
        const tocAbbrev = getTocAbbrev(dep.operator);
        const bgColor = i % 2 === 0 ? 'var(--card-background-color, #fafafa)' : 'var(--primary-background-color, white)';

        let statusBg = '#dcfce7';
        let statusColor = '#166534';
        let statusText = 'ON TIME';

        if (dep.is_cancelled) {
          statusBg = '#fee2e2';
          statusColor = '#991b1b';
          statusText = 'CANCELLED';
        } else if (dep.is_delayed) {
          statusBg = '#fef3c7';
          statusColor = '#92400e';
          statusText = '+' + dep.delay_minutes + 'm';
        }

        let callingPoints = '';
        if (this.config.show_calling_points && dep.calling_at && dep.calling_at.length > 0) {
          const points = dep.calling_at.slice(0, 3).join(' • ');
          const more = dep.calling_at.length > 3 ? ` • +${dep.calling_at.length - 3}` : '';
          callingPoints = `<div style="font-size: 12px; color: var(--secondary-text-color); margin-top: 4px;">via ${points}${more}</div>`;
        }

        const badgeHtml = this.config.show_operator_badge
          ? `<span style="background: ${tocColour}; color: white; padding: 3px 7px; border-radius: 4px; font-size: 11px; font-weight: 700; flex-shrink: 0;">${tocAbbrev}</span>`
          : '';

        const platformHtml = this.config.show_platforms
          ? `<div style="flex-shrink: 0; width: 60px; text-align: center;">
               <div style="font-size: 10px; color: var(--secondary-text-color); text-transform: uppercase; margin-bottom: 2px;">Plat</div>
               <div style="font-size: 20px; font-weight: 700;">${dep.platform || '—'}</div>
             </div>`
          : '';

        const statusHtml = this.config.show_status
          ? `<div style="flex-shrink: 0; min-width: 85px; text-align: right;">
               <span style="background: ${statusBg}; color: ${statusColor}; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-block; white-space: nowrap;">${statusText}</span>
             </div>`
          : '';

        html += `
          <div style="display: flex; align-items: center; gap: 8px; padding: 14px 12px; background: ${bgColor}; border-left: 5px solid ${tocColour}; margin-bottom: 4px; border-radius: 6px;">
            
            <div style="flex-shrink: 0; width: 70px;">
              <div style="font-size: 24px; font-weight: 700; color: ${tocColour};">${dep.expected}</div>
            </div>
            
            <div style="flex: 1; min-width: 0; padding-right: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-weight: 600; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${dep.destination}</div>
                ${badgeHtml}
              </div>
              ${callingPoints}
            </div>
            
            ${platformHtml}
            ${statusHtml}
            
          </div>
        `;
      }
    }

    this.content.innerHTML = html;
  }

  getCardSize() {
    return 3;
  }
}

class RailboardCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    if (!this._initialized) {
      this._initialized = true;
      this.render();
    }
  }

  customElements.define('railboard-card', RailboardCard);
customElements.define('railboard-card-editor', RailboardCardEditor);

  set hass(hass) {
    this._hass = hass;
    if (this._initialized) {
      this.updateEntityPicker();
    }
  }

  configChanged(newConfig) {
    const event = new Event('config-changed', {
      bubbles: true,
      composed: true,
    });
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
          <input type="text" id="title-input" value="${this._config.title || ''}" placeholder="e.g., Crystal Palace" />
        </div>
        
        <div class="input-row">
          <label>Max Departures</label>
          <input type="number" id="max-input" min="1" max="50" value="${this._config.max_departures || 10}" />
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
          <label>Show Calling Points</label>
          <input type="checkbox" id="calling-switch" ${this._config.show_calling_points !== false ? 'checked' : ''} />
        </div>
        
        <div class="switch-row">
          <label>Show Operator Badge</label>
          <input type="checkbox" id="badge-switch" ${this._config.show_operator_badge !== false ? 'checked' : ''} />
        </div>
      </div>
      
      <style>
        .card-config {
          padding: 16px;
        }
        .entity-row, .input-row, .switch-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        label {
          flex: 1;
          font-weight: 500;
          color: var(--primary-text-color);
        }
        select, input[type="text"], input[type="number"] {
          flex: 2;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          background: var(--card-background-color);
          color: var(--primary-text-color);
        }
        input[type="checkbox"] {
          width: 40px;
          height: 20px;
          cursor: pointer;
        }
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
      entities.map(eid => `<option value="${eid}" ${eid === this._config.entity ? 'selected' : ''}>${eid}</option>`).join('');
  }

  setupListeners() {
    const entityPicker = this.querySelector('#entity-picker');
    const titleInput = this.querySelector('#title-input');
    const maxInput = this.querySelector('#max-input');
    const platformsSwitch = this.querySelector('#platforms-switch');
    const statusSwitch = this.querySelector('#status-switch');
    const callingSwitch = this.querySelector('#calling-switch');
    const badgeSwitch = this.querySelector('#badge-switch');

    if (entityPicker) {
      entityPicker.addEventListener('change', (e) => {
        this._config = { ...this._config, entity: e.target.value };
        this.configChanged(this._config);
      });
    }

    if (titleInput) {
      titleInput.addEventListener('change', (e) => {
        this._config = { ...this._config, title: e.target.value };
        this.configChanged(this._config);
      });
    }

    if (maxInput) {
      maxInput.addEventListener('change', (e) => {
        this._config = { ...this._config, max_departures: parseInt(e.target.value) };
        this.configChanged(this._config);
      });
    }

    if (platformsSwitch) {
      platformsSwitch.addEventListener('change', (e) => {
        this._config = { ...this._config, show_platforms: e.target.checked };
        this.configChanged(this._config);
      });
    }

    if (statusSwitch) {
      statusSwitch.addEventListener('change', (e) => {
        this._config = { ...this._config, show_status: e.target.checked };
        this.configChanged(this._config);
      });
    }

    if (callingSwitch) {
      callingSwitch.addEventListener('change', (e) => {
        this._config = { ...this._config, show_calling_points: e.target.checked };
        this.configChanged(this._config);
      });
    }

    if (badgeSwitch) {
      badgeSwitch.addEventListener('change', (e) => {
        this._config = { ...this._config, show_operator_badge: e.target.checked };
        this.configChanged(this
