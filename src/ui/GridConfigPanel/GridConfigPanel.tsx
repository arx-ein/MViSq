import { useState } from "react";
import { useGridConfigStore } from "../../store/useGridConfigStore";
import { midiToName } from "../../utils/noteNames";
import "./GridConfigPanel.css";

export default function GridConfigPanel() {
  const [open, setOpen] = useState(false);
  const gridSize = useGridConfigStore((s) => s.gridSize);
  const noteMapping = useGridConfigStore((s) => s.noteMapping);
  const setNoteAt = useGridConfigStore((s) => s.setNoteAt);
  const resetMapping = useGridConfigStore((s) => s.resetMapping);

  if (!open) {
    return (
      <button className="config-toggle" onClick={() => setOpen(true)}>
        Configure Grid
      </button>
    );
  }

  // Display rows top-to-bottom (reversed from mapping order)
  const rows: { rowIndex: number; cells: { index: number; midi: number }[] }[] = [];
  for (let row = gridSize - 1; row >= 0; row--) {
    const cells: { index: number; midi: number }[] = [];
    for (let col = 0; col < gridSize; col++) {
      const idx = row * gridSize + col;
      cells.push({ index: idx, midi: noteMapping[idx] });
    }
    rows.push({ rowIndex: row, cells });
  }

  return (
    <div className="config-panel">
      <div className="config-panel__header">
        <span>Grid Note Mapping</span>
        <div className="config-panel__actions">
          <button onClick={resetMapping}>Reset</button>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
      </div>
      <div
        className="config-panel__grid"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {rows.flatMap((row) =>
          row.cells.map((cell) => (
            <input
              key={cell.index}
              type="number"
              className="config-panel__input"
              min={0}
              max={127}
              value={cell.midi}
              title={midiToName(cell.midi)}
              onChange={(e) => {
                const val = Math.max(0, Math.min(127, Number(e.target.value)));
                setNoteAt(cell.index, val);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
