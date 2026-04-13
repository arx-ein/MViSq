import { create } from "zustand";
import { generateDefaultMapping } from "../utils/defaultMapping";

interface GridConfigState {
  gridRows: number;
  gridColumns: number;
  noteMapping: number[];
  setGridRows: (rows: number) => void;
  setGridColumns: (columns: number) => void;
  setNoteAt: (index: number, midi: number) => void;
  setNoteMapping: (mapping: number[]) => void;
  resetMapping: (startNote?: number) => void;
  resetSize: () => void;
}

const DEFAULT_ROWS = 8;
const DEFAULT_COLUMNS = 8;
const DEFAULT_START_NOTE = 36;

export const useGridConfigStore = create<GridConfigState>((set) => ({
  gridRows: DEFAULT_ROWS,
  gridColumns: DEFAULT_COLUMNS,
  noteMapping: generateDefaultMapping(DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_START_NOTE),
  setGridRows: (rows) =>
    set({ gridRows: rows, noteMapping: generateDefaultMapping(rows, useGridConfigStore.getState().gridColumns) }),
  setGridColumns: (columns) =>
    set({ gridColumns: columns, noteMapping: generateDefaultMapping(useGridConfigStore.getState().gridRows, columns) }),
  setNoteAt: (index, midi) =>
    set((state) => {
      const mapping = [...state.noteMapping];
      mapping[index] = midi;
      return { noteMapping: mapping };
    }),
  setNoteMapping: (mapping) => set({ noteMapping: mapping }),
  resetMapping: (startNote = DEFAULT_START_NOTE) =>
    set((state) => ({
      noteMapping: generateDefaultMapping(state.gridRows, state.gridColumns, startNote),
    })),
  resetSize: () =>
    set(() => ({ gridRows: DEFAULT_ROWS, gridColumns: DEFAULT_COLUMNS }))
}));
