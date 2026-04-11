/**
 * Generates a default chromatic note mapping for an NxN grid.
 * Bottom-left is the lowest note, top-right is the highest.
 * Starts from MIDI 36 (C2) by default.
 *
 * Returns a flat array of MIDI note numbers in row-major order,
 * with row 0 = bottom row (so index 0 is bottom-left).
 */
export function generateDefaultMapping(
  gridSize: number,
  startNote: number = 36
): number[] {
  return Array.from(
    { length: gridSize },
    (_, i) => Array.from(
      { length: gridSize },
      (_, j) => startNote + i * 5 + j * 2
    )
  ).flat();
}
