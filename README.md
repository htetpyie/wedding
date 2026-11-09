# Wedding website

Astro, TypeScript (strict), and Tailwind CSS with the official Vite plugin.

## Development

- `npm install`
- `npm run dev` — local development server
- `npm run check` — Astro and TypeScript diagnostics
- `npm run build` — static production site in `dist/`
- `npm run preview` — preview the production build

## Structure

- `src/pages/` — routes
- `src/layouts/` — shared document layouts
- `src/components/` — reusable interface components
- `src/styles/global.css` — Tailwind entry and base styles
- `src/lib/` — shared application helpers
- `public/` — static assets

## Shared guestbook

Cloudflare Pages Functions + D1 publish new wishes immediately. Guests can
submit and read visible wishes, but cannot edit, delete, or approve records.
Follow [the D1 setup guide](docs/cloudflare-d1.md) to initialize and bind the database.
The live backend becomes available only after the binding and migration are applied.

## Customize the invitation

Edit `src/data/wedding.ts` for names, date label, venue, map URL, and optional music path.
Replace the five SVG placeholders in `public/photos/` with your photographs and update
image paths in that data file. Story copy is in `src/pages/index.astro`.

The music control plays a generated gentle melody until a music URL is configured.
Audio starts only after a guest clicks a control. The opened-invitation preference is
remembered locally; `#details` links bypass the cover as well. Gallery supports modal,
keyboard, and swipe navigation. Animations respect reduced-motion preferences.

Run `node --test tests/wishes.test.js` for backend permission/validation checks.
Astro dev alone does not run the Cloudflare Functions backend.
