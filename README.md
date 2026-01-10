# Pasaules Tūre

Ultra cycling events website built with Next.js 16 and Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `forest-deep` | #1a3a2f | Primary dark, headers, buttons |
| `forest-medium` | #2d5a47 | Secondary backgrounds |
| `forest-light` | #3d7a5f | Accents, borders |
| `amber` | #e07b39 | CTA buttons, highlights |
| `amber-light` | #f4a261 | Icons, accent text |
| `cream` | #f5f0e6 | Section backgrounds |
| `cream-light` | #faf8f3 | Page background |
| `earth-dark` | #2c2416 | Body text |
| `stone` | #8b7355 | Muted text |
| `sand` | #d4c4a8 | Borders, dividers |

### Typography

- **Display**: Archivo Black (headings)
- **Body**: DM Sans (content)

### Components

All sections use `rounded-3xl` corners with `mt-6 mx-2` spacing for a friendly, card-based layout.

## Adding Events

1. Add event data in `app/data/events.ts`
2. Add images to `public/events/{slug}/`
