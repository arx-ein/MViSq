import { useGridConfigStore } from "../../store/useGridConfigStore";
import GridCell from "./GridCell";
import "./Grid.css";

interface GridProps {
  onCellClick?: (midi: number) => void;
}

export default function Grid({ onCellClick }: GridProps) {
  const gridRows = useGridConfigStore((s) => s.gridRows);
  const gridColumns = useGridConfigStore((s) => s.gridColumns);
  const noteMapping = useGridConfigStore((s) => s.noteMapping);

  // Render rows top-to-bottom, but mapping is bottom-to-top,
  // so reverse the row order for display.
  const rows: number[][] = [];
  for (let row = gridRows - 1; row >= 0; row--) {
    const start = row * gridColumns;
    rows.push(noteMapping.slice(start, start + gridColumns));
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        maxWidth: `${gridColumns * 70}px`,
      }}
    >
      {rows.flat().map((midi, i) => (
        <GridCell key={i} midi={midi} onClick={onCellClick} />
      ))}
    </div>
  );
}
