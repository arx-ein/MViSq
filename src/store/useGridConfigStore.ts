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
  resetMapping: () => void;
  resetSize: () => void;
}

const DEFAULT_ROWS = 8;
const DEFALUT_COLUMNS = 8;

export const useGridConfigStore = create<GridConfigState>((set) => ({
  gridRows: DEFAULT_ROWS,
  gridColumns: DEFALUT_COLUMNS,
  noteMapping: generateDefaultMapping(DEFAULT_ROWS, DEFALUT_COLUMNS),
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
  resetMapping: () =>
    set((state) => ({
      noteMapping: generateDefaultMapping(state.gridRows, state.gridColumns),
    })),
  resetSize: () =>
    set(() => ({ gridRows: DEFAULT_ROWS, gridColumns: DEFALUT_COLUMNS }))
}));
