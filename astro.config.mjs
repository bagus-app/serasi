import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://serasi.netasia.workers.dev/", // ← GANTI dengan domain aslimu nanti
  integrations: [sitemap()],
});