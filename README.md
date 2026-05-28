# 🍄 Forage Season Card — Lovelace Dashboard Cards

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Lovelace cards for the [Forage Season](https://github.com/halfwit/forage-season-integration) integration. Two card types in one resource file — no extra dependencies required.

---

## Data & Attribution

All observation data is sourced from the iNaturalist community project:

> **[Edible Flora & Fungi Worldwide](https://www.inaturalist.org/projects/edible-flora-fungi-worldwide)**
> on [iNaturalist](https://www.inaturalist.org)

Observations © iNaturalist contributors, licensed **CC BY-NC**. Both cards render a live attribution footer linking directly to the project.

---

## Installation

### Via HACS (recommended)
1. In HACS → Frontend → ⋮ → **Custom Repositories**
2. Add this repo URL, category = **Dashboard**
3. Install **Forage Season Card**, refresh your browser

### Manual
1. Copy `lovelace/forage-season-cards.js` to `<config>/www/`
2. **Settings → Dashboards → Resources → Add resource:**
   ```
   URL:  /local/forage-season-cards.js
   Type: JavaScript Module
   ```
3. Refresh your browser (Shift+reload)

> **Requires** the [Forage Season integration](https://github.com/halfwit/forage-season-integration) to be installed and configured first.

---

## Cards

### `forage-season-card` — Single species

Displays one species with photo, name, season badge, observation count, and links.

```yaml
type: custom:forage-season-card
entity: sensor.chanterelle
```

### `forage-season-grid-card` — Grid or list of all in-season species

Auto-discovers all Forage Season sensor entities. No entity list needed.

```yaml
# Grid (default)
type: custom:forage-season-grid-card
title: "What's in season"
columns: 2
filter: all          # "all" | "plants" | "fungi"
sort: count          # "count" (default) | "name"
show_out_of_season: false

# Compact list
type: custom:forage-season-grid-card
layout: list
sort: name
```

| Option | Default | Description |
|---|---|---|
| `layout` | `grid` | `grid` or `list` |
| `columns` | `2` | Grid columns |
| `title` | `Forageables` | Card header title |
| `filter` | `all` | `all`, `plants`, or `fungi` |
| `sort` | `count` | `count` (most observed first) or `name` |
| `show_out_of_season` | `false` | Include greyed-out out-of-season species |
| `max` | unlimited | Cap the number of displayed species |

---

## License & credits

- Observation data © iNaturalist contributors, CC BY-NC
- Project: [Edible Flora & Fungi Worldwide](https://www.inaturalist.org/projects/edible-flora-fungi-worldwide)
- Card code: MIT
