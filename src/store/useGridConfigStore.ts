import { create } from "zustand";
import { generateDefaultMapping } from "../utils/defaultMapping";

interface GridConfigState {
  gridSize: number;
  noteMapping: number[];
  setGridSize: (size: number) => void;
  setNoteAt: (index: number, midi: number) => void;
  setNoteMapping: (mapping: number[]) => void;
  resetMapping: () => void;
}

const DEFAULT_SIZE = 8;

export const useGridConfigStore = create<GridConfigState>((set) => ({
  gridSize: DEFAULT_SIZE,
  noteMapping: generateDefaultMapping(DEFAULT_SIZE),
  setGridSize: (size) =>
    set({ gridSize: size, noteMapping: generateDefaultMapping(size) }),
  setNoteAt: (index, midi) =>
    set((state) => {
      const mapping = [...state.noteMapping];
      mapping[index] = midi;
      return { noteMapping: mapping };
    }),
  setNoteMapping: (mapping) => set({ noteMapping: mapping }),
  resetMapping: () =>
    set((state) => ({
      noteMapping: generateDefaultMapping(state.gridSize),
    })),
}));
