import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const weddings = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/weddings" }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    couple: z.object({
      nick: z.tuple([z.string(), z.string()]),
      full: z.tuple([z.string(), z.string()]),
      monogram: z.string(),
    }),
    tagline: z.string(),
    date: z.object({ iso: z.string(), display: z.string(), day: z.string() }),
    venue: z.object({ name: z.string(), address: z.string(), maps: z.string().url() }),
    events: z.array(
      z.object({ name: z.string(), time: z.string(), start: z.string(), end: z.string() })
    ).min(1),
    memories: z.array(
      z.object({
        shape: z.enum(["book", "letter", "ring", "gate"]),
        year: z.string(),
        label: z.string(),
        title: z.string(),
        text: z.string(),
      })
    ).min(1).max(6),
    gifts: z.array(
      z.object({ bank: z.string(), number: z.string(), holder: z.string() })
    ).default([]),
    contact: z.object({ whatsapp: z.string() }),
    share: z.object({ title: z.string(), text: z.string() }).optional(),
    theme: z.enum(["champagne", "rose", "sage", "aurora"]).optional(),
  }),
});

export const collections = { weddings };