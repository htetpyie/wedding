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

## Next steps

The starter intentionally leaves the final visual design open. Guestbook submission,
moderation, storage, and spam protection will be implemented after selecting a backend.
Hosting remains portable: deploy `dist/` to any static host and test access on Yangon
networks before choosing a provider. No Cloudflare services or credentials are required.

## Customize the invitation

Edit `src/data/wedding.ts` for names, date label, venue, map URL, and optional music path.
Replace the five SVG placeholders in `public/photos/` with your photographs and update
image paths in that data file. Story copy is in `src/pages/index.astro`.

The music control plays a generated gentle melody until a music URL is configured.
Audio starts only after a guest clicks a control. The opened-invitation preference is
remembered locally; `#details` links bypass the cover as well. Gallery supports modal,
keyboard, and swipe navigation. Animations respect reduced-motion preferences.

The guestbook is a device-local preview, not a shared or moderated online guestbook.
No real wedding date or times are set, so calendar export is deferred until those are known.
