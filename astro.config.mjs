import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://langityangsama.id", // ← GANTI dengan domain aslimu nanti
  integrations: [sitemap()],
});