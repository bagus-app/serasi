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

/* ============ PUSTAKA BENTUK ============ */

const bookPts: [number, number][] = [
  [-2, 0.8], [0, 0.2], [2, 0.8], [2, -0.8], [0, -1.4], [-2, -0.8],
];
const bookEdg: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]];

const letterPts: [number, number][] = [
  [-1.6, 1], [1.6, 1], [1.6, -1], [-1.6, -1], [0, 0],
];
const letterEdg: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1]];

const ringPts: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const a = Math.PI / 2 + (i / 18) * Math.PI * 2;
    pts.push([Math.cos(a) * 1.15, -0.25 + Math.sin(a) * 1.15]);
  }
  pts.push([-0.34, 1.45], [0, 1.95], [0.34, 1.45]);
  return pts;
})();
const ringEdg: [number, number][] = (() => {
  const edg: [number, number][] = Array.from({ length: 18 }, (_, i) => [i, (i + 1) % 18] as [number, number]);
  edg.push([0, 18], [18, 19], [19, 20], [20, 0]);
  return edg;
})();

const gatePts: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI - (i / 8) * Math.PI;
    pts.push([Math.cos(a) * 1.5, Math.sin(a) * 1.5]);
  }
  pts.push([-1.5, -1.7], [1.5, -1.7]);
  return pts;
})();
const gateEdg: [number, number][] = (() => {
  const edg: [number, number][] = Array.from({ length: 8 }, (_, i) => [i, i + 1] as [number, number]);
  edg.push([0, 9], [8, 10], [9, 10]);
  return edg;
})();

export const SHAPE_LIBRARY = {
  book: { points: bookPts, edges: bookEdg },
  letter: { points: letterPts, edges: letterEdg },
  ring: { points: ringPts, edges: ringEdg },
  gate: { points: gatePts, edges: gateEdg },
} as const;

export type ShapeId = keyof typeof SHAPE_LIBRARY;

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
    positions.push(
      def.points[a][0], def.points[a][1], 0,
      def.points[b][0], def.points[b][1], 0
    );
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: lineColor,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.LineSegments(lineGeo, lineMat);
  group.add(line);

  const starPos: number[] = [];
  for (const [x, y] of def.points) starPos.push(x, y, 0);
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
  const starsMat = new THREE.PointsMaterial({
    size: 0.55,
    map: glow,
    color: 0xf3ead8,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  group.add(new THREE.Points(starGeo, starsMat));

  return { def, group, line, lineMat, starsMat, verts: positions.length / 3 };
}

/* ============ MONOGRAM PENUTUP ============ */

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

export function buildMonogram(monogram: string, glow: THREE.Texture): {
  group: THREE.Group;
  mat: THREE.PointsMaterial;
} {
  const A: [number, number][] = [[-1, -1], [0, 1], [1, -1]];
  const Abar: [number, number][] = [[-0.42, -0.1], [0.42, -0.1]];
  const L: [number, number][] = [[0, 1], [0, -1], [1.05, -1]];

  const chars = monogram.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
  const c1 = chars[0] ?? "A";
  const c2 = chars[1] ?? "L";

  const getShape = (ch: string): [number, number][][] => {
    if (ch === "L") return [L];
    return [A, Abar];
  };

  const pts: [number, number][] = [
    ...getShape(c1).flatMap((s) => sampleStroke(s)).map(([x, y]) => [x - 2.6, y] as [number, number]),
    [0, -0.6],
    ...getShape(c2).flatMap((s) => sampleStroke(s)).map(([x, y]) => [x + 1.9, y] as [number, number]),
  ];

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