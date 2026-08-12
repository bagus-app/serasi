const SYNODIC = 29.53058867;

function moonPhaseName(d: Date): string {
  const ref = Date.UTC(2024, 0, 11, 11, 57); // referensi bulan baru
  const days = (d.getTime() - ref) / 86400000;
  const ph = (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
  const names = [
    "baru", "sabit muda", "separuh awal", "cembung awal",
    "purnama", "cembung akhir", "separuh akhir", "sabit tua",
  ];
  return names[Math.floor(ph * 8 + 0.5) % 8];
}

export function initCountdown() {
  const el = document.getElementById("hitung-mundur");
  if (!el) return;
  const WED = new Date("2026-06-20T08:00:00+07:00");
  const now = new Date();
  const days = Math.ceil((WED.getTime() - now.getTime()) / 86400000);
  const phase = moonPhaseName(now);
  el.textContent = days > 0
    ? `dalam ${days} hari lagi · malam ini bulan ${phase}`
    : `hari ini tiba · malam ini bulan ${phase}`;
}