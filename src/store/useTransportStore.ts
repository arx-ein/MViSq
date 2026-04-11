import { create } from "zustand";

export type TransportState = "stopped" | "playing" | "paused";

interface TransportStoreState {
  state: TransportState;
  position: number;
  duration: number;
  bpm: number;
  midiLoaded: boolean;
  setState: (state: TransportState) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setBpm: (bpm: number) => void;
  setMidiLoaded: (loaded: boolean) => void;
}

export const useTransportStore = create<TransportStoreState>((set) => ({
  state: "stopped",
  position: 0,
  duration: 0,
  bpm: 120,
  midiLoaded: false,
  setState: (state) => set({ state }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setBpm: (bpm) => set({ bpm }),
  setMidiLoaded: (loaded) => set({ midiLoaded: loaded }),
}));
