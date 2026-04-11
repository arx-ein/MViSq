import { create } from "zustand";

interface ActiveNotesState {
  /** Map of MIDI note number -> velocity (0 = off) */
  activeNotes: Map<number, number>;
  setNoteOn: (midi: number, velocity: number) => void;
  setNoteOff: (midi: number) => void;
  clearAll: () => void;
}

export const useActiveNotesStore = create<ActiveNotesState>((set) => ({
  activeNotes: new Map(),
  setNoteOn: (midi, velocity) =>
    set((state) => {
      const next = new Map(state.activeNotes);
      next.set(midi, velocity);
      return { activeNotes: next };
    }),
  setNoteOff: (midi) =>
    set((state) => {
      const next = new Map(state.activeNotes);
      next.delete(midi);
      return { activeNotes: next };
    }),
  clearAll: () => set({ activeNotes: new Map() }),
}));
