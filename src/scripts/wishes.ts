import { supabase } from "../lib/supabase";

export interface Wish {
  id?: number;
  nama: string;
  pesan: string;
  created_at?: string;
}

export const live = supabase !== null;

const localKey = (slug: string) => `langit-doa:${slug}`;

function localAll(slug: string): Wish[] {
  try {
    return JSON.parse(localStorage.getItem(localKey(slug)) ?? "[]");
  } catch {
    return [];
  }
}

export async function loadWishes(slug: string): Promise<Wish[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("wishes")
      .select("id, nama, pesan, created_at")
      .eq("slug", slug)
      .order("id", { ascending: true })
      .limit(500);
    if (!error && data) return data as Wish[];
    return [];
  }
  return localAll(slug);
}

export async function addWish(
  slug: string,
  wish: { nama: string; pesan: string }
): Promise<Wish> {
  if (supabase) {
    const { data, error } = await supabase
      .from("wishes")
      .insert({ slug, nama: wish.nama, pesan: wish.pesan })
      .select()
      .single();
    if (!error && data) return data as Wish;
  }
  const w: Wish = { ...wish };
  const all = localAll(slug);
  all.push(w);
  while (all.length > 50) all.shift();
  localStorage.setItem(localKey(slug), JSON.stringify(all));
  return w;
}

export function onNewWish(slug: string, cb: (w: Wish) => void): () => void {
  if (!supabase) return () => {};
  const sb = supabase; // lokal & pasti non-null di dalam closure

  const ch = sb
    .channel(`wishes-${slug}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "wishes", filter: `slug=eq.${slug}` },
      (payload) => cb(payload.new as Wish)
    )
    .subscribe();

  return () => {
    sb.removeChannel(ch);
  };
}