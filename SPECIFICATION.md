# SDD Agenda Planner

## Goal

Create a mobile-first React web app that improves the conference agenda experience by making it easy to:

- get a clear overview of parallel talks
- choose talks across five tracks
- save those choices locally on the current device
- switch quickly between `My picks` and the full unfiltered agenda
- view essential session metadata at a glance

## Product constraints

- PWA
- deployable to static hosting
- no login
- all user choices stored in `localStorage`
- optimized first for phone portrait mode
- usable on larger screens without changing core interaction model

## Core user needs

1. See date, time, track, title and speaker immediately.
2. Expand a session to read details.
3. Mark a session as selected with one tap.
4. View only selected sessions as a personal filter.
5. Switch back to the full agenda easily.
6. Keep selections saved on the device between visits.
7. Understand breaks such as coffee and lunch quickly.

## Current implementation

- Vite + React + TypeScript
- Mantine UI for a clear, professional component baseline
- `vite-plugin-pwa` for PWA manifest and service worker registration
- local persistence with Mantine `useLocalStorage`
- mobile-first vertical schedule with:
  - day selector
  - `Only my picks` toggle
  - track filter chips
  - selected sessions summary
  - full agenda grouped by timeslot

## Data model

Each session contains:

- `id`
- `date`
- `start`
- `end`
- `track`
- `type`
- `title`
- `speaker`
- `summary`
- `room`

## Visual direction

- warm off-white base
- charcoal text and surfaces
- orange accent with supporting teal, blue, yellow and plum track colors
- high contrast cards and large headings
- compact but readable spacing on mobile

## Assumptions and known gaps

- The live SDD agenda page could not be fetched directly from this environment during implementation, so the app currently ships with a structured sample dataset inspired by the conference format rather than a verified full scrape of the official agenda.
- The architecture is intentionally set up so the agenda dataset can be replaced later without changing the UI logic.
- The PWA manifest currently uses the existing SVG icon. If needed, dedicated 192x192 and 512x512 PNG icons can be added in a later iteration.

## Suggested next iterations

1. Replace sample agenda data with verified official SDD agenda content.
2. Add search across title, speaker and summary.
3. Add conflict detection when multiple selected talks share the same time slot.
4. Add export to calendar or ICS.
5. Add speaker detail pages or speaker modal cards.
6. Add deep links to open a specific day or selected filter state.
