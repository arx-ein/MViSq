import * as Tone from "tone";

export class AudioEngine {
  private synth: Tone.PolySynth | null = null;
  private started = false;

  /** Must be called from a user gesture before any audio plays. */
  async ensureStarted(): Promise<void> {
    if (!this.started) {
      await Tone.start();
      this.started = true;
    }
    // Lazily create the synth only after the AudioContext is running.
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: {
          attack: 0.01,
          decay: 0.2,
          sustain: 0.4,
          release: 0.3,
        },
        volume: -9
      }).toDestination();
      this.synth.maxPolyphony = 32;
    }
  }

  /**
   * Trigger a note with the given velocity and duration.
   * @param midi MIDI note number
   * @param velocity 0-127
   * @param duration Duration in seconds
   * @param time Audio context time (from Tone.Transport callback)
   */
  noteOn(midi: number, velocity: number, duration: number, time?: number): void {
    if (!this.synth) return;
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    const vel = velocity / 127;
    this.synth.triggerAttackRelease(freq, duration, time, vel);
  }

  /** Begin sustaining a note indefinitely (for interactive hold). */
  attack(midi: number, velocity: number, time?: number): void {
    if (!this.synth) return;
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    this.synth.triggerAttack(freq, time, velocity / 127);
  }

  /** Release a held note. */
  release(midi: number, time?: number): void {
    if (!this.synth) return;
    const freq = Tone.Frequency(midi, "midi").toFrequency();
    this.synth.triggerRelease(freq, time);
  }

  /** Immediately release all notes */
  releaseAll(): void {
    this.synth?.releaseAll();
  }

  dispose(): void {
    this.synth?.dispose();
    this.synth = null;
    this.started = false;
  }
}
