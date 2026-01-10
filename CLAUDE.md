# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pasaules Tūre website - a Next.js 16 application for ultra cycling events in Latvia.

## Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 (via PostCSS)
- **Path alias**: `@/*` maps to project root

## Project Structure

```
app/
├── [slug]/page.tsx      # Dynamic event pages
├── globals.css          # Design system (colors, animations, patterns)
├── components/
│   ├── EventPage.tsx    # Main event page component
│   ├── Header.tsx       # Navigation header with event buttons
│   ├── FAQ.tsx          # FAQ accordion component
│   └── Icons.tsx        # SVG icon components
├── data/
│   ├── events.ts        # Event data and types
│   └── events.server.ts # Server-side image utilities
├── privatuma-politika/  # Privacy policy page
└── noteikumi/           # Terms page
```

## Design System

### Colors (CSS variables in globals.css)

- **Forest palette**: `forest-deep`, `forest-medium`, `forest-light`, `moss`
- **Accent**: `amber`, `amber-light`, `amber-glow`
- **Neutrals**: `earth-dark`, `earth-warm`, `stone`, `sand`, `cream`, `cream-light`

### Typography

- **Display font**: Archivo Black (`.font-display` class)
- **Body font**: DM Sans (default)

### CSS Utilities (globals.css)

- `.hero-overlay` - Gradient overlay for hero images
- `.topo-pattern` / `.topo-pattern-light` - Topographic line backgrounds
- `.noise-overlay` - Subtle grain texture
- `.glass` / `.glass-dark` - Glassmorphism effects
- `.btn-primary` / `.btn-secondary` - Button styles
- `.card-elevated` - Elevated card with hover effect
- `.section-divider` - Gradient divider line
- Animation classes: `.animate-fade-in-up`, `.animate-float`, `.animate-pulse-glow`

### Layout Patterns

- All sections use `rounded-3xl` corners
- Section spacing: `mt-6 mx-2`
- Content constrained to `max-w-5xl` on desktop

## Key Patterns

- Event images stored in `public/events/{slug}/`
- Home page redirects to closest upcoming event
- Distance selection defaults to full distance (last item)
- Facts bar shows: Surface type (row 1), Location/Date/Time limit (row 2)
- Distance buttons show: Name, Distance (km), Elevation (m)
