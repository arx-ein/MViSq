import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGridConfigStore } from "../../store/useGridConfigStore";
import { midiToName } from "../../utils/noteNames";
import "./GridConfigPanel.css";

export default function GridConfigPanel() {
  const [startNote, setStartNote] = useState(36);
  const [transposeOffset, setTransposeOffset] = useState(12);
  const {
    gridRows, gridColumns,
    setGridRows, setGridColumns,
    noteMapping, setNoteMapping, setNoteAt,
    resetMapping, resetSize,
  } = useGridConfigStore(useShallow((s) => ({
    gridRows: s.gridRows,
    gridColumns: s.gridColumns,
    setGridRows: s.setGridRows,
    setGridColumns: s.setGridColumns,
    noteMapping: s.noteMapping,
    setNoteMapping: s.setNoteMapping,
    setNoteAt: s.setNoteAt,
    resetMapping: s.resetMapping,
    resetSize: s.resetSize,
  })));

  // Display rows top-to-bottom (reversed from mapping order)
  const rows: { rowIndex: number; cells: { index: number; midi: number }[] }[] = [];
  for (let row = gridRows - 1; row >= 0; row--) {
    const cells: { index: number; midi: number }[] = [];
    for (let col = 0; col < gridColumns; col++) {
      const idx = row * gridColumns + col;
      cells.push({ index: idx, midi: noteMapping[idx] });
    }
    rows.push({ rowIndex: row, cells });
  }

  return (
    <div className="config-panel" style={{
      maxWidth: `${gridColumns * 70}px`,
    }}>
      <div className="config-panel__header">
        <h2>Grid Note Mapping</h2>
        <div className="config-panel__actions">
          <button onClick={() => { resetSize(); resetMapping(); }}>Reset all</button>
        </div>
      </div>
      <div className="config-panel__size">
        <div>
          Grid Size: &nbsp;
          <input
            key="columns"
            type="number"
            className="config-panel__input"
            min={1}
            max={16}
            value={gridColumns}
            title="Grid columns"
            onChange={(e) => {
              setGridColumns(Number(e.target.value));
            }}
          />
          &nbsp; columns &times; &nbsp;
          <input
            key="rows"
            type="number"
            className="config-panel__input"
            min={1}
            max={16}
            value={gridRows}
            title="Grid rows"
            onChange={(e) => {
              setGridRows(Number(e.target.value));
            }}
          />
          &nbsp; rows
        </div>
      </div>
      <div
        className="config-panel__grid"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
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
      <h3>Controls</h3>
      <div className="config-panel__control">
        <p>
          <button onClick={() => resetMapping(startNote)}>Generate default (WHiSq) mapping</button>
          &nbsp;with lowest note number:&nbsp;
          <input type="number" min={0} max={127} value={startNote} onChange={(e) => { setStartNote(Number(e.target.value)); }} />
        </p>
        <p>
          <button onClick={() => setNoteMapping(noteMapping.map((m) => m + transposeOffset))}>Transpose</button>
          &nbsp;by offset:&nbsp;
          <input type="number" min={-127} max={127} value={transposeOffset} onChange={(e) => { setTransposeOffset(Number(e.target.value)); }} />
        </p>
      </div>
    </div>
  );
}
