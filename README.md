
---

## `README.md`

The full documentation:

```markdown
# Railboard Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/crspytopgn/ha-railboard-dashboard.svg)](https://github.com/crspytopgn/ha-railboard-dashboard/releases)
[![License](https://img.shields.io/github/license/crspytopgn/ha-railboard-dashboard.svg)](LICENSE)

A beautiful, customizable UK train departure board card for Home Assistant.

![Railboard Card Preview](https://via.placeholder.com/800x400.png?text=Railboard+Card+Screenshot)

## Features

✨ **Beautiful Design** - Clean, modern interface inspired by real UK departure boards  
🎨 **Colour-Coded** - Each train operator displayed in authentic brand colours  
⚙️ **Fully Customizable** - Configure everything via the visual UI editor  
🚂 **Real-Time Data** - Shows live departure information from your Railboard sensors  
📱 **Responsive** - Looks great on all screen sizes  
🌙 **Theme Support** - Automatically adapts to your Home Assistant theme  

## Prerequisites

**You must have the Railboard integration installed first:**

🔗 [Install Railboard Integration](https://github.com/crspytopgn/ha-railboard)

This card displays data from Railboard sensors - it won't work without them!

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Go to **Frontend**
3. Click the **three dots** menu (top right)
4. Select **"Custom repositories"**
5. Add repository URL: `https://github.com/crspytopgn/ha-railboard-dashboard`
6. Category: **Lovelace**
7. Click **Add**
8. Search for **"Railboard Card"**
9. Click **Download**
10. **Restart Home Assistant**
11. **Hard refresh your browser** (Ctrl+F5 or Cmd+Shift+R)

### Manual Installation

1. Download `railboard-card.js` from the [latest release](https://github.com/crspytopgn/ha-railboard-dashboard/releases)
2. Copy to `/config/www/community/railboard-card/railboard-card.js`
3. Add resource in **Configuration** → **Lovelace Dashboards** → **Resources**:
   - URL: `/hacsfiles/railboard-card/railboard-card.js`
   - Type: **JavaScript Module**
4. **Restart Home Assistant**
5. **Hard refresh browser**

## Usage

### Add via Visual Editor (Easiest)

1. Edit your dashboard
2. Click **+ Add Card**
3. Search for **"Railboard Card"**
4. Select it
5. Configure in the visual editor:
   - Choose your Railboard sensor
   - Set optional title
   - Toggle display options
   - Set max departures
6. Click **Save**

### Add via YAML

```yaml
type: custom:railboard-card
entity: sensor.railboard_departures_crystal_palace
title: Crystal Palace
show_platforms: true
show_status: true
show_calling_points: true
show_operator_badge: true
max_departures: 10
