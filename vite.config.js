import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const pages = [
  "about",
  "accessories",
  "bikes",
  "bookings",
  "contact",
  "faqs",
  "forms",
  "gear",
  "hours",
  "location",
  "store",
];
const legacyLinks = {
  name: "legacy-page-links",
  generateBundle() {
    for (const page of pages)
      this.emitFile({
        type: "asset",
        fileName: `${page}.html`,
        source: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./index.html#/${page}"><title>Umpleby Motorcycles</title></head><body><a href="./index.html#/${page}">Continue to ${page}</a></body></html>`,
      });
  },
};
export default defineConfig({ plugins: [react(), legacyLinks], base: "./" });
