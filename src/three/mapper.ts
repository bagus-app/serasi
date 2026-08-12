import * as THREE from "three";
import {
  SHAPE_LIBRARY,
  buildConstellation,
  buildMonogram,
  type BuiltConstellation,
  type ShapeId,
} from "./shapes";

export interface MemoryData {
  shape: ShapeId;
  year: string;
  label: string;
  title: string;
  text: string;
}

/**
 * Menyusun N memori menjadi rasi yang berbaris zigzag
 * di sepanjang jalur kamera (z = -8 sampai -62).
 */
export function buildMemories(
  memories: MemoryData[],
  glow: THREE.Texture,
  small: boolean
): BuiltConstellation[] {
  const N = memories.length;
  const zStart = -8;
  const zEnd = -62;

  return memories.map((mem, i) => {
    const z = N === 1 ? (zStart + zEnd) / 2 : zStart + ((zEnd - zStart) * i) / (N - 1);
    const sideX = (i % 2 === 0 ? 1 : -1) * 3.2 * (small ? 0.45 : 1);
    const shape = SHAPE_LIBRARY[mem.shape];

    return buildConstellation(
      {
        id: mem.shape,
        label: mem.label,
        pos: [sideX, 0.2, z],
        points: shape.points,
        edges: shape.edges,
        scale: (small ? 0.8 : 1) * 1.5,
      },
      glow
    );
  });
}

export { buildMonogram };