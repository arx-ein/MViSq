import * as Tone from "tone";
import type { ParsedMidi } from "../types/midi";
import { AudioEngine } from "../audio/AudioEngine";
import { useActiveNotesStore } from "../store/useActiveNotesStore";
import { useTransportStore } from "../store/useTransportStore";

export class MidiScheduler {
  private audioEngine: AudioEngine;
  private animFrameId: number | null = null;

  constructor() {
    this.audioEngine = new AudioEngine();
  }

  async ensureAudioStarted(): Promise<void> {
    await this.audioEngine.ensureStarted();
  }

  load(parsed: ParsedMidi): void {
    const transport = Tone.getTransport();

    // Clear previous schedule
    transport.cancel();
    transport.stop();
    transport.position = 0;
    useActiveNotesStore.getState().clearAll();

    // Set tempo
    transport.bpm.value = parsed.bpm;
    useTransportStore.getState().setBpm(parsed.bpm);
    useTransportStore.getState().setDuration(parsed.duration);
    useTransportStore.getState().setMidiLoaded(true);

    const draw = Tone.getDraw();

    // Schedule all note events
    for (const note of parsed.notes) {
      transport.schedule((time) => {
        // Audio: sample-accurate
        this.audioEngine.noteOn(note.midi, note.velocity, note.duration, time);

        // Visual: synced to animation frame
        draw.schedule(() => {
          useActiveNotesStore.getState().setNoteOn(note.midi, note.velocity);
        }, time);

        draw.schedule(() => {
          useActiveNotesStore.getState().setNoteOff(note.midi);
        }, time + note.duration);
      }, note.time);
    }

    // Schedule stop at end
    transport.schedule(() => {
      draw.schedule(() => {
        this.stop();
      }, Tone.now());
    }, parsed.duration + 0.1);
  }

  async play(): Promise<void> {
    await this.ensureAudioStarted();
    Tone.getTransport().start();
    useTransportStore.getState().setState("playing");
    this.startPositionPolling();
  }

  pause(): void {
    Tone.getTransport().pause();
    useTransportStore.getState().setState("paused");
    this.stopPositionPolling();
  }

  stop(): void {
    const transport = Tone.getTransport();
    transport.stop();
    transport.position = 0;
    this.audioEngine.releaseAll();
    useActiveNotesStore.getState().clearAll();
    useTransportStore.getState().setState("stopped");
    useTransportStore.getState().setPosition(0);
    this.stopPositionPolling();
  }

  seek(time: number): void {
    const transport = Tone.getTransport();
    transport.seconds = time;
    useActiveNotesStore.getState().clearAll();
    useTransportStore.getState().setPosition(time);
  }

  /** Begin holding a note (on pointer down). */
  async noteAttack(midi: number): Promise<void> {
    await this.ensureAudioStarted();
    this.audioEngine.attack(midi, 100);
  }

  /** Release a held note (on pointer up / leave). */
  noteRelease(midi: number): void {
    this.audioEngine.release(midi);
  }

  private startPositionPolling(): void {
    const poll = () => {
      const seconds = Tone.getTransport().seconds;
      useTransportStore.getState().setPosition(seconds);
      this.animFrameId = requestAnimationFrame(poll);
    };
    this.animFrameId = requestAnimationFrame(poll);
  }

  private stopPositionPolling(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  dispose(): void {
    this.stop();
    this.audioEngine.dispose();
  }
}
