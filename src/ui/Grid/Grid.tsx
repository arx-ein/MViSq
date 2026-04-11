import { useGridConfigStore } from "../../store/useGridConfigStore";
import GridCell from "./GridCell";
import "./Grid.css";

interface GridProps {
  onCellClick?: (midi: number) => void;
}

export default function Grid({ onCellClick }: GridProps) {
  const gridSize = useGridConfigStore((s) => s.gridSize);
  const noteMapping = useGridConfigStore((s) => s.noteMapping);

  // Render rows top-to-bottom, but mapping is bottom-to-top,
  // so reverse the row order for display.
  const rows: number[][] = [];
  for (let row = gridSize - 1; row >= 0; row--) {
    const start = row * gridSize;
    rows.push(noteMapping.slice(start, start + gridSize));
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
    >
      {rows.flat().map((midi, i) => (
        <GridCell key={i} midi={midi} onClick={onCellClick} />
      ))}
    </div>
  );
}
