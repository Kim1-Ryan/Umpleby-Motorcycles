# Umpleby Motorcycles

React + Vite website for the Durban Suzuki dealership. The redesign retains the original logo, blue palette, coastal imagery, catalogue, and business information.

## Run locally

Use Node.js 22.12 or newer and pnpm 11.

```sh
pnpm install
pnpm dev
```

## Production

```sh
pnpm build
pnpm preview
```

Publish the contents of `dist/` to your static host. Relative asset paths and hash routing support GitHub Pages repository subdirectories without server rewrite rules. The build includes redirects for the original `.html` page links. Native config loading avoids Vite's configuration bundler filesystem restrictions on Windows.

## Content and booking

- `src/catalogue.json`: all 44 motorcycles, 9 gear items, 6 accessories and original FAQs. Prices and stock are carried over from the original site; update them here as stock changes.
- `public/assets/`: original imagery and finance downloads. Image filename casing has been corrected for case-sensitive hosting; JPEG files formerly ending in `.file` now use `.jpg`.
- `src/main.jsx`: React pages, shared navigation, catalogue filters, enquiry links and booking form.
- `src/styles.css`: responsive design and shared styling.

Booking requests use the email approval and calendar workflow in `server/google-apps-script/`. See `server/google-apps-script/SETUP.md` for deployment. Set `VITE_BOOKING_ENDPOINT` to that deployment's `/exec` URL, then rebuild the site. Without that setting, the form directs customers to the dealership instead of sending to the old storage endpoint. Requests are emailed to admin@motocycle.co.za; approval checks calendar conflicts, creates the event with 1-day, 1-hour and 10-minute popup reminders, and emails the customer. Live email/calendar delivery requires Google deployment and is not part of local verification.

Company application files were missing in the original site, so these now direct customers to the team. Contact details, map links, and FAQ statements remain sourced from the original site and should be confirmed by the business before publishing. Live booking submissions are not part of local verification.

Original booking storage: https://docs.google.com/spreadsheets/d/1McQMauMperb8sq1qRS3NveZzUsJy7PoWrOBMDVXuXV8/edit

## GitHub Pages

The React/Vite source must be built before publishing. Serving the repository root directly loads `/src/main.jsx`, which cannot run on GitHub Pages.

In the repository's Settings → Pages → Build and deployment, set Source to **GitHub Actions**. The checked-in `.github/workflows/deploy.yml` builds on every push to `main` and publishes only `dist/`, with the repository URL used as Vite's base path. You can also run it manually from Actions → Deploy website to GitHub Pages → Run workflow.

The website URL is https://kim1-ryan.github.io/Umpleby-Motorcycles/. Wait for a successful Actions deployment before opening it. Do not enable a separate Jekyll/root-directory deployment. Booking email/calendar activation remains separate; it is not required to load the website.
