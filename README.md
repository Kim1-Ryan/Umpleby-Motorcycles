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

The form preserves the original Google Apps Script endpoint and field names. Set `VITE_BOOKING_ENDPOINT` in `.env.local` to override it (this URL is public client configuration). The endpoint must accept FormData and return JSON `{ "result": "success" }` with browser-compatible CORS. Successful requests are described as requests awaiting confirmation. A timeout or failed response asks the customer to call before retrying, since a request may have reached the server.

Company application files were missing in the original site, so these now direct customers to the team. Contact details, map links, and FAQ statements remain sourced from the original site and should be confirmed by the business before publishing. Live booking submissions are not part of local verification.

Original booking storage: https://docs.google.com/spreadsheets/d/1McQMauMperb8sq1qRS3NveZzUsJy7PoWrOBMDVXuXV8/edit
