class RailboardCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this.config.entity];
    if (!state) return;

    const walkingTime = this.config.walking_time ?? 5;
    const deps = state.attributes.departures || [];

    this.innerHTML = this.render(deps, walkingTime);
  }

  render(deps, walkingTime) {
    // ⬅️ this is where 90% of your existing logic goes
    return `<div>...</div>`;
  }

  getCardSize() {
    return 5;
  }
}

customElements.define('railboard-card', RailboardCard);
