import sharp from "sharp";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";

const DIR = "src/content/weddings";
const OUT = "public/og";
mkdirSync(OUT, { recursive: true });

function hash(str) {
  let h = 7;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 2147483647;
  return h;
}

function stars(seed, n = 70) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  let out = "";
  for (let i = 0; i < n; i++) {
    out += `<circle cx="${(rnd() * 1200).toFixed(0)}" cy="${(rnd() * 630).toFixed(0)}" r="${(rnd() * 1.6 + 0.4).toFixed(1)}" fill="#f3ead8" opacity="${(rnd() * 0.7 + 0.2).toFixed(2)}"/>`;
  }
  return out;
}

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function ogSvg({ kicker, title, subtitle }) {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0d0a14"/>
  <ellipse cx="600" cy="680" rx="700" ry="260" fill="#1a1330"/>
  ${stars(hash(title))}
  <circle cx="600" cy="330" r="150" fill="none" stroke="#c9a36a" stroke-opacity="0.25"/>
  <circle cx="600" cy="180" r="4" fill="#ecd3a1"/>
  <text x="600" y="150" text-anchor="middle" font-family="Verdana, sans-serif" font-size="22" letter-spacing="8" fill="#c9a36a">${esc(kicker)}</text>
  <text x="600" y="330" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="96" fill="#f3ead8">${esc(title)}</text>
  <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#b9af9d">${esc(subtitle)}</text>
  <text x="600" y="560" text-anchor="middle" font-family="Verdana, sans-serif" font-size="20" letter-spacing="6" fill="#c9a36a">LANGIT YANG SAMA</text>
</svg>`;
}

async function main() {
  for (const f of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
    const d = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
    await sharp(Buffer.from(ogSvg({
      kicker: "UNDANGAN PERNIKAHAN",
      title: `${d.couple.nick[0]} & ${d.couple.nick[1]}`,
      subtitle: d.date.display,
    }))).png().toFile(`${OUT}/${d.slug}.png`);
    console.log("OG dibuat:", d.slug);
  }
  await sharp(Buffer.from(ogSvg({
    kicker: "UNDANGAN PERNIKAHAN DIGITAL",
    title: "Serasi",
    subtitle: "Satu langit, dua bintang, doa yang tak terhitung.",
  }))).png().toFile(`${OUT}/brand.png`);
  console.log("OG dibuat: brand");
}
main();