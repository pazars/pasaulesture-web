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

## Key Patterns

- Event images stored in `public/events/{slug}/`
- Home page redirects to closest upcoming event
- Distance selection defaults to full distance (last item)
- Content constrained to `max-w-5xl` on desktop
