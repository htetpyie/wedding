# Connect the guestbook to Cloudflare D1

This implementation uses **Cloudflare Pages Functions**, not an Astro SSR adapter.
Use these steps for a Git-connected **Pages** project. If your existing project is a
**Worker** (for example its address ends in workers.dev), this deployment needs a
Pages project or a separate Worker API; simply binding D1 to that Worker does not
activate the functions/ directory.

## 1. Create and initialize the database

In Cloudflare, open Storage & databases → D1 → Create database. Name it
`wedding-wishes`. Open its Console, paste the full contents of
`migrations/0001_wishes.sql`, and run it. This creates the table and index without
removing existing wishes. Do this once before deploying the new form.

## 2. Bind it to the existing Pages project

Open Workers & Pages → your Pages project → Settings → Bindings → Add → D1 database.
Set the **binding name to `DB`** (uppercase) and select `wedding-wishes`.
Save, then redeploy. No database password or API key goes into the frontend or GitHub.
Bind production only; use a different database for previews if preview wishes are needed.

## 3. Deploy the source

Commit and push these changes to your connected production branch. Keep your build
command `npm run build` and build output directory `dist`. The `functions/` folder
must remain at the repository/project root next to package.json, NOT inside public/.
Pages Git integration compiles it separately. public/_routes.json ensures only /api/*
uses Functions, while the rest remains static.

If you use GitHub Actions instead of Pages Git integration, run checks/build then
`wrangler pages deploy dist --project-name YOUR_PAGES_PROJECT` from the repository
root so Wrangler discovers functions/. Dashboard drag-and-drop does not compile
Pages Functions. Existing static Workers deployments cannot use this command directly.

## 4. Verify

- Visit `https://YOUR_SITE/api/wishes`: initially expect `{"wishes":[]}`.
- Submit a test wish. Expect a saved/pending-approval message.
- In D1 Console: `SELECT id, name, message, approved, created_at FROM wishes ORDER BY created_at DESC;`
- Copy the test wish's ID and approve using the statement below.
- Refresh the website, preferably on another device. The wish should appear.
- If the endpoint is HTML/404, Functions did not deploy. If it returns 503, check
  the DB binding, migration, and deployment logs. A redeploy is required after binding.

## 5. Manage wishes (Cloudflare account owners only)

List pending wishes:

```sql
SELECT id, name, message, created_at FROM wishes
WHERE approved = 0 ORDER BY created_at DESC;
```

Approve one (replace the placeholder with its actual ID):

```sql
UPDATE wishes SET approved = 1 WHERE id = 'PASTE_WISH_ID';
```

Hide one without deleting it:

```sql
UPDATE wishes SET approved = 0 WHERE id = 'PASTE_WISH_ID';
```

Permanently delete one, only when you intend to:

```sql
DELETE FROM wishes WHERE id = 'PASTE_WISH_ID';
```

There is no public update/delete endpoint or public admin key. Visitors cannot
choose approved status. All submissions start pending. Public GET returns at most
100 latest approved wishes. Name and message are displayed as text, not HTML.

The form includes a honeypot, server-side length/body validation, and cross-origin
checks. These are basic abuse controls, not a complete bot defense. For heavy spam,
add Turnstile or a Cloudflare rate-limiting rule before extending public submissions.
Do not store sensitive information in guest messages; approved messages are public.
Export/backup the database from Cloudflare before large manual changes.

## Local development and previous wishes

`npm run dev` previews the design but does not execute Pages Functions. For a full
local integration use Wrangler Pages dev with a local D1 binding and apply the SQL
migration to that local database, or test with a separately bound Pages preview.
Backend tests: `node --test tests/wishes.test.js`.

Existing localStorage wishes are not uploaded automatically. The new guestbook
ignores those browser-only entries; they are not shared database records.
