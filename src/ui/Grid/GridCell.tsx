import { memo } from "react";
import { useActiveNotesStore } from "../../store/useActiveNotesStore";
import { midiToName } from "../../utils/noteNames";
import "./GridCell.css";

interface GridCellProps {
  midi: number;
  onClick?: (midi: number) => void;
}

function GridCellInner({ midi, onClick }: GridCellProps) {
  const velocity = useActiveNotesStore(
    (s) => s.activeNotes.get(midi) ?? 0
  );

  const isActive = velocity > 0;
  const brightness = velocity / 127;

  return (
    <button
      className={`grid-cell ${isActive ? "grid-cell--active" : ""}`}
      style={
        isActive
          ? {
              backgroundColor: `rgba(0, 230, 118, ${0.3 + brightness * 0.7})`,
              boxShadow: `0 0 ${8 + brightness * 12}px rgba(0, 230, 118, ${brightness * 0.6})`,
            }
          : undefined
      }
      onClick={() => onClick?.(midi)}
      title={`${midiToName(midi)} (${midi})`}
    >
      <span className="grid-cell__label">{midiToName(midi)}</span>
    </button>
  );
}

const GridCell = memo(GridCellInner);
export default GridCell;
