# Railboard Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)  
[![GitHub release](https://img.shields.io/github/release/crspytopgn/ha-railboard-dashboard.svg)](https://github.com/crspytopgn/ha-railboard-dashboard/releases)  
[![License](https://img.shields.io/github/license/crspytopgn/ha-railboard-dashboard.svg)](LICENSE)  

A beautiful, **customizable UK train departure board card** for Home Assistant.

---

## Features

✨ **Two Board Styles** – Clean **Modern** look, or a retro amber-on-black **Dot Matrix** LED board  
🎨 **Operator Badges** – Each train operator is shown with authentic brand colors  
⚙️ **Fully Customizable** – Configure all settings via the visual card editor  
⏱ **Walking Time Filter** – Only shows departures you can reach on foot in a given time  
🕐 **Arrival Time** – Shows when each train reaches its destination, both as a clock time and journey length  
🚉 **Tap for Calling Points** – Tap a departure to fetch and expand its full stop-by-stop list on demand  
🚂 **Real-Time Data** – Shows live departures from your Railboard sensors  
🚶 **Leave Now Banner** – A bold banner appears once the next catchable departure is due within walking time  
⚠️ **Disruption Alert** – A red strip flags active delays/cancellations without scanning the whole list  
📊 **Punctuality Footer** – Shows today's rolling on-time percentage  
🚌 **Bus Support** – Point the card at a `sensor.railboard_bus_<stop_id>` entity and it automatically renders a bus arrivals board instead  
📱 **Responsive Layout** – Adapts to tablets, phones, and large screens  
🌙 **Theme Support** – Automatically matches your Home Assistant theme  

---

## Prerequisites

**You must have the Railboard integration installed first:**  

🔗 [Install Railboard Integration](https://github.com/crspytopgn/ha-railboard)  

This card reads from Railboard sensors – it **won’t work** without them.

Tapping a departure to expand its calling points calls the integration's
`railboard.get_service_detail` action, so that service must be registered
(it is, as long as the Railboard integration is installed and up to date).

---

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant  
2. Go to **Frontend**  
3. Click the **three dots menu** → **Custom repositories**  
4. Add repository URL: `https://github.com/crspytopgn/ha-railboard-dashboard`  
5. Category: **Lovelace**  
6. Click **Add**  
7. Search for **Railboard Card**  
8. Click **Download**  
9. **Restart Home Assistant**  
10. **Hard refresh your browser** (Ctrl+F5 / Cmd+Shift+R)  

### Manual Installation

1. Download `railboard-card.js` from the [latest release](https://github.com/crspytopgn/ha-railboard-dashboard/releases)  
2. Copy it to `/config/www/community/railboard-card/railboard-card.js`  
3. Add a resource in **Configuration → Lovelace Dashboards → Resources**:
   - URL: `/hacsfiles/railboard-card/railboard-card.js`  
   - Type: **JavaScript Module**  
4. **Restart Home Assistant**  
5. **Hard refresh your browser**  

---

## Usage

### Add via Visual Editor (Easiest)

1. Edit your dashboard  
2. Click **+ Add Card**  
3. Search for **Railboard Card**  
4. Select it  
5. Configure in the editor:  
   - Choose your Railboard sensor (a `sensor.railboard_departures_*` or `sensor.railboard_bus_*` entity — the card auto-detects which one you picked)  
   - Optional: pick a Leave Now / Disruption / Punctuality sensor to enable those banners and footer  
   - Optional: Set a card title  
   - Choose a **Board Style**: Modern (default) or Dot Matrix (retro amber LED look, forced black background regardless of your Home Assistant theme)  
   - Toggle display options: platforms, status, operator/line badge, arrival time, and tap-to-expand calling points  
   - Set **Max Departures**  
   - Set **Min Walking Time (minutes)** to filter departures you can reach  
6. Click **Save**  

### Add via YAML

```yaml
type: custom:railboard-card
entity: sensor.railboard_departures_crystal_palace
title: Crystal Palace
board_style: modern  # or dot_matrix for a retro amber LED look
show_platforms: true
show_status: true
show_calling_points: true
show_operator_badge: true
show_arrival_time: true
max_departures: 10
min_walk_time: 5  # Only show departures you can reach in 5 minutes
leave_now_entity: binary_sensor.railboard_leave_now_cyp
disruption_entity: binary_sensor.railboard_disruption_cyp
punctuality_entity: sensor.railboard_punctuality_cyp
```

For a bus stop, point `entity` at a `sensor.railboard_bus_<stop_id>` entity instead — the
card detects the different attribute shape automatically and renders a bus arrivals
board (line, destination, ETA in minutes and clock time, stop letter) rather than a
train departure board. `leave_now_entity`/`disruption_entity` also accept the bus
equivalents (`binary_sensor.railboard_bus_leave_now_<stop_id>` /
`binary_sensor.railboard_bus_disruption_<stop_id>`).
