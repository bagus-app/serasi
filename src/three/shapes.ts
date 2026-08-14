import * as THREE from "three";

export interface ConstellationDef {
  id: string;
  label: string;
  pos: [number, number, number];
  points: [number, number][];
  edges: [number, number][];
  scale: number;
}

export interface BuiltConstellation {
  def: ConstellationDef;
  group: THREE.Group;
  line: THREE.LineSegments;
  lineMat: THREE.LineBasicMaterial;
  starsMat: THREE.PointsMaterial;
  verts: number;
}

/* ============ TIPE BENTUK ============ */

export interface CustomShape {
  points: [number, number][];
  edges: [number, number][];
}
export type ShapeInput = string | CustomShape;

/* ============ PUSTAKA BENTUK (21 rasi) ============ */

export const SHAPE_LIBRARY: Record<string, CustomShape> = {
  /* — dasar — */
  book:   { points: [[-2,0.8],[0,0.2],[2,0.8],[2,-0.8],[0,-1.4],[-2,-0.8]],
            edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[1,4]] },
  letter: { points: [[-1.6,1],[1.6,1],[1.6,-1],[-1.6,-1],[0,0]],
            edges: [[0,1],[1,2],[2,3],[3,0],[0,4],[4,1]] },
  ring:   { points: (()=>{const p:[number,number][]=[];for(let i=0;i<18;i++){const a=Math.PI/2+(i/18)*Math.PI*2;p.push([Math.cos(a)*1.15,-0.25+Math.sin(a)*1.15]);}p.push([-0.34,1.45],[0,1.95],[0.34,1.45]);return p;})(),
            edges: (()=>{const e:[number,number][]=Array.from({length:18},(_,i)=>[i,(i+1)%18] as [number,number]);e.push([0,18],[18,19],[19,20],[20,0]);return e;})() },
  gate:   { points: (()=>{const p:[number,number][]=[];for(let i=0;i<=8;i++){const a=Math.PI-(i/8)*Math.PI;p.push([Math.cos(a)*1.5,Math.sin(a)*1.5]);}p.push([-1.5,-1.7],[1.5,-1.7]);return p;})(),
            edges: (()=>{const e:[number,number][]=Array.from({length:8},(_,i)=>[i,i+1] as [number,number]);e.push([0,9],[8,10],[9,10]);return e;})() },

  /* — objek kisah — */
  heart:    { points: [[0,-1.6],[-1.2,-0.4],[-1.6,0.6],[-0.9,1.2],[0,0.6],[0.9,1.2],[1.6,0.6],[1.2,-0.4]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]] },
  umbrella: { points: [[-1.6,0.2],[-1.1,1.0],[-0.5,1.4],[0,1.5],[0.5,1.4],[1.1,1.0],[1.6,0.2],[0,-1.2],[0.5,-1.5]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,6],[3,7],[7,8]] },
  coffee:   { points: [[-1,0.6],[1,0.6],[0.7,-0.8],[-0.7,-0.8],[1.5,0],[-0.3,1.0],[-0.3,1.5],[0.3,1.0],[0.3,1.5]],
              edges: [[0,1],[1,2],[2,3],[3,0],[1,4],[4,2],[5,6],[7,8]] },
  music:    { points: [[-0.8,-1.0],[-0.5,0.8],[0.8,-1.2],[1.1,0.6]],
              edges: [[0,1],[2,3],[1,3]] },
  plane:    { points: [[0,1.6],[-1.6,-0.6],[-0.4,-0.4],[0,-1.4],[0.4,-0.4],[1.6,-0.6]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
  mountain: { points: [[-1.8,-1],[-0.6,1.2],[0,0.2],[0.8,0.9],[1.8,-1]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,0]] },
  boat:     { points: [[-1.4,-0.6],[1.4,-0.6],[1.0,-1.2],[-1.0,-1.2],[0,1.4],[1.2,-0.4],[0,-0.4]],
              edges: [[0,1],[1,2],[2,3],[3,0],[6,4],[4,5],[5,6]] },
  key:      { points: [[0,1.6],[-0.6,1.0],[0,0.4],[0.6,1.0],[0,-1.4],[0.5,-1.0],[0.5,-1.4],[0,-1.0]],
              edges: [[0,1],[1,2],[2,3],[3,0],[2,4],[7,5],[4,6]] },
  moon:     { points: [[0,1.4],[-1.0,0.9],[-1.4,0],[-1.0,-0.9],[0,-1.4],[-0.4,-0.7],[-0.5,0],[-0.4,0.7]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]] },
  star5:    { points: [[0,1.5],[-0.35,0.5],[-1.4,0.45],[-0.55,-0.2],[-0.85,-1.2],[0,-0.6],[0.85,-1.2],[0.55,-0.2],[1.4,0.45],[0.35,0.5]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,0]] },
  infinity: { points: [[0,0],[-0.6,0.8],[-1.5,0.8],[-1.9,0],[-1.5,-0.8],[-0.6,-0.8],[0.6,0.8],[1.5,0.8],[1.9,0],[1.5,-0.8],[0.6,-0.8]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[7,8],[8,9],[9,10],[10,0]] },
  tulip:    { points: [[-0.7,0.6],[-0.7,1.4],[0,1.0],[0.7,1.4],[0.7,0.6],[0,0.6],[0,-1.4],[0,-0.8],[-0.7,-1.2],[0.7,-1.2]],
              edges: [[0,1],[1,2],[2,3],[3,4],[4,0],[0,5],[5,6],[7,8],[7,9]] },

  /* — rasi asli — */
  crux:        { points: [[0,1.5],[0,-1.5],[-1.0,0.2],[1.0,0.0]],
                 edges: [[0,1],[2,3]] },
  orion:       { points: [[-0.8,1.2],[0.8,1.0],[-0.3,0],[0,0],[0.3,0],[0.9,-1.2],[-0.9,-1.1]],
                 edges: [[0,1],[0,2],[1,4],[2,3],[3,4],[2,6],[4,5],[6,5]] },
  cassiopeia:  { points: [[-1.6,0.4],[-0.8,-0.5],[0,0.5],[0.8,-0.5],[1.6,0.4]],
                 edges: [[0,1],[1,2],[2,3],[3,4]] },
  lyra:        { points: [[0,1.4],[-0.3,0.8],[0.4,0.7],[-0.2,-0.6],[0.5,-0.7]],
                 edges: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]] },
  "big-dipper":{ points: [[-1.8,0.9],[-1.1,0.7],[-0.4,0.6],[0.4,0.7],[0.6,-0.4],[-0.3,-0.5]],
                 edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,2]] },
};

export type ShapeId = keyof typeof SHAPE_LIBRARY;

/* Ambil bentuk dari string (preset) atau objek (custom). */
export function resolveShape(input: ShapeInput): CustomShape {
  if (typeof input === "string") return SHAPE_LIBRARY[input] ?? SHAPE_LIBRARY.book;
  return input;
}

/* ============ BUILDER RASI ============ */

export function buildConstellation(
  def: ConstellationDef,
  glow: THREE.Texture,
  lineColor = 0xd9b87c
): BuiltConstellation {
  const group = new THREE.Group();
  group.position.set(...def.pos);
  group.scale.setScalar(def.scale);

  const positions: number[] = [];
  for (const [a, b] of def.edges) {
    if (a < 0 || b < 0 || a >= def.points.length || b >= def.points.length) continue;
    positions.push(
      def.points[a][0], def.points[a][1], 0,
      def.points[b][0], def.points[b][1], 0
    );
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: lineColor, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const line = new THREE.LineSegments(lineGeo, lineMat);
  group.add(line);

  const starPos: number[] = [];
  for (const [x, y] of def.points) starPos.push(x, y, 0);
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const starsMat = new THREE.PointsMaterial({
    size: 0.55, map: glow, color: 0xf3ead8, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  group.add(new THREE.Points(starGeo, starsMat));

  return { def, group, line, lineMat, starsMat, verts: positions.length / 3 };
}

/* ============ MONOGRAM PENUTUP (A–Z) ============ */

function sampleStroke(pts: [number, number][], step = 0.14): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.round(len / step));
    for (let j = 0; j <= n; j++) {
      const k = j / n;
      out.push([
        x1 + (x2 - x1) * k + (Math.random() - 0.5) * 0.05,
        y1 + (y2 - y1) * k + (Math.random() - 0.5) * 0.05,
      ]);
    }
  }
  return out;
}

/* Font garis 3×5 — setiap huruf = kumpulan goresan bintang */
const FONT: Record<string, number[][][]> = {
  A: [[[0,0],[1,4],[2,0]],[[0.35,1.3],[1.65,1.3]]],
  B: [[[0,0],[0,4],[1.4,4],[2,3.2],[2,2.8],[1.4,2],[0,2]],[[1.4,2],[2,1.2],[2,0.8],[1.4,0],[0,0]]],
  C: [[[2,3.2],[1.2,4],[0.8,4],[0,3.2],[0,0.8],[0.8,0],[1.2,0],[2,0.8]]],
  D: [[[0,0],[0,4],[1.2,4],[2,3],[2,1],[1.2,0],[0,0]]],
  E: [[[2,4],[0,4],[0,0],[2,0]],[[0,2],[1.4,2]]],
  F: [[[2,4],[0,4],[0,0]],[[0,2],[1.4,2]]],
  G: [[[2,3.2],[1.2,4],[0.8,4],[0,3.2],[0,0.8],[0.8,0],[1.2,0],[2,0.8],[2,2],[1.2,2]]],
  H: [[[0,0],[0,4]],[[2,0],[2,4]],[[0,2],[2,2]]],
  I: [[[1,0],[1,4]],[[0.4,4],[1.6,4]],[[0.4,0],[1.6,0]]],
  J: [[[2,4],[2,0.8],[1.2,0],[0.6,0],[0,0.8]]],
  K: [[[0,0],[0,4]],[[2,4],[0,1.6]],[[0.7,2.2],[2,0]]],
  L: [[[0,4],[0,0],[2,0]]],
  M: [[[0,0],[0,4],[1,1.6],[2,4],[2,0]]],
  N: [[[0,0],[0,4],[2,0],[2,4]]],
  O: [[[0.8,4],[0,3.2],[0,0.8],[0.8,0],[1.2,0],[2,0.8],[2,3.2],[1.2,4],[0.8,4]]],
  P: [[[0,0],[0,4],[1.5,4],[2,3.2],[2,2.8],[1.5,2],[0,2]]],
  Q: [[[0.8,4],[0,3.2],[0,0.8],[0.8,0],[1.2,0],[2,0.8],[2,3.2],[1.2,4],[0.8,4]],[[1.3,0.7],[2.2,-0.2]]],
  R: [[[0,0],[0,4],[1.5,4],[2,3.2],[2,2.8],[1.5,2],[0,2]],[[0.8,2],[2,0]]],
  S: [[[2,3.4],[1.4,4],[0.6,4],[0,3.4],[0,2.6],[0.6,2],[1.4,2],[2,1.4],[2,0.6],[1.4,0],[0.6,0],[0,0.6]]],
  T: [[[1,0],[1,4]],[[0,4],[2,4]]],
  U: [[[0,4],[0,0.8],[0.8,0],[1.2,0],[2,0.8],[2,4]]],
  V: [[[0,4],[1,0],[2,4]]],
  W: [[[0,4],[0.5,0],[1,2.4],[1.5,0],[2,4]]],
  X: [[[0,0],[2,4]],[[2,0],[0,4]]],
  Y: [[[0,4],[1,2],[2,4]],[[1,2],[1,0]]],
  Z: [[[0,4],[2,4],[0,0],[2,0]]],
};

export function buildMonogram(monogram: string, glow: THREE.Texture): {
  group: THREE.Group;
  mat: THREE.PointsMaterial;
} {
  const letters = (monogram.replace(/[^A-Za-z]/g, "").toUpperCase() || "AL").slice(0, 2).split("");
  const c1 = letters[0] ?? "A";
  const c2 = letters[1] ?? "L";

  const LETTER_W = 2;
  const GAP = 1.2;
  const TOTAL_W = LETTER_W * 2 + GAP * 2; // 5.2
  const pts: [number, number][] = [];

  const addLetter = (ch: string, offsetX: number) => {
    const strokes = FONT[ch] ?? FONT.A;
    for (const s of strokes) {
      for (const [x, y] of sampleStroke(s as [number, number][], 0.16)) {
        pts.push([x + offsetX - TOTAL_W / 2, y - 2]);
      }
    }
  };

  addLetter(c1, 0);
  addLetter(c2, LETTER_W + GAP);
  pts.push([0, 0]); // titik pemisah

  const arr = new Float32Array(pts.length * 3);
  pts.forEach(([x, y], i) => {
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = 0;
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.5,
    map: glow,
    color: 0xecd3a1,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const group = new THREE.Group();
  group.add(new THREE.Points(g, mat));
  group.position.set(0, -0.5, -118);
  group.scale.setScalar(5.5);
  return { group, mat };
}