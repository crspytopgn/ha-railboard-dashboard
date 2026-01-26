# Railboard Card

A beautiful, customizable UK train departure board card for Home Assistant.

## Features

✨ **Beautiful Design** - Clean, modern interface inspired by UK departure boards  
🎨 **Colour-Coded** - Each train operator has authentic brand colours  
⚙️ **Fully Customizable** - Configure via UI - no YAML needed  
🚂 **Real-Time Data** - Works with Railboard integration sensors  
📱 **Responsive** - Looks great on mobile and desktop  

## Installation

1. **Install via HACS:**
   - HACS → Frontend
   - Three dots menu → Custom repositories
   - Add: `https://github.com/crspytopgn/ha-railboard-dashboard`
   - Category: **Lovelace**
   - Search for "Railboard Card"
   - Click Download

2. **Add to your dashboard:**
   - Edit Dashboard → Add Card
   - Search for "Railboard Card"
   - Select your Railboard sensor entity
   - Configure options

## Configuration

All configuration is done via the visual editor:

- **Entity** - Select your Railboard departures sensor
- **Title** - Optional header (e.g., "Crystal Palace")
- **Max Departures** - How many trains to show (1-50)
- **Show Platforms** - Toggle platform numbers
- **Show Status** - Toggle ON TIME/DELAYED badges
- **Show Calling Points** - Toggle "via..." stations
- **Show Operator Badge** - Toggle TOC badges (SN, LO, etc.)

## Requirements

You must have the **Railboard integration** installed first:
https://github.com/crspytopgn/ha-railboard

## Example

```yaml
type: custom:railboard-card
entity: sensor.railboard_departures_crystal_palace
title: Crystal Palace
show_platforms: true
show_status: true
show_calling_points: true
show_operator_badge: true
max_departures: 10
