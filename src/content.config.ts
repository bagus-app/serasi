import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const SHAPE_NAMES = [
  "book","letter","ring","gate",
  "heart","umbrella","coffee","music","plane","mountain","boat","key","moon","star5","infinity","tulip",
  "crux","orion","cassiopeia","lyra","big-dipper",
] as const;

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
        shape: z.union([
          z.enum(SHAPE_NAMES),
          z.object({
            points: z.array(z.tuple([z.number(), z.number()])).min(2).max(40),
            edges: z.array(z.tuple([z.number(), z.number()])).min(1).max(60),
          }),
        ]),
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
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).min(1).max(6).optional(),
    video: z.object({ youtubeId: z.string(), caption: z.string().optional() }).optional(),
    dresscode: z.object({
      text: z.string(),
      note: z.string().optional(),
      colors: z.array(z.object({ hex: z.string(), name: z.string() })).default([]),
    }).optional(),
  }),
});

export const collections = { weddings };