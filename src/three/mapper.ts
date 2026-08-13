import * as THREE from "three";
import {
  buildConstellation, buildMonogram, resolveShape,
  type BuiltConstellation, type ShapeInput,
} from "./shapes";

export interface MemoryData {
  shape: ShapeInput;
  year: string;
  label: string;
  title: string;
  text: string;
}

export function buildMemories(
  memories: MemoryData[],
  glow: THREE.Texture,
  small: boolean,
  lineColor = 0xd9b87c
): BuiltConstellation[] {
  const N = memories.length;
  const zStart = -8;
  const zEnd = -62;

  return memories.map((mem, i) => {
    const z = N === 1 ? (zStart + zEnd) / 2 : zStart + ((zEnd - zStart) * i) / (N - 1);
    const sideX = (i % 2 === 0 ? 1 : -1) * 3.2 * (small ? 0.45 : 1);
    const shape = resolveShape(mem.shape); // string → preset | objek → custom

    return buildConstellation(
      {
        id: typeof mem.shape === "string" ? mem.shape : "custom",
        label: mem.label,
        pos: [sideX, 0.2, z],
        points: shape.points,
        edges: shape.edges,
        scale: (small ? 0.8 : 1) * 1.5,
      },
      glow,
      lineColor
    );
  });
}

export { buildMonogram };