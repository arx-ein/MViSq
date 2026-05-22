export class MidiInputHandler {
  private midiAccess: MIDIAccess | null = null;
  private readonly onNoteOn: (midi: number, velocity: number) => void;
  private readonly onNoteOff: (midi: number) => void;

  constructor(
    onNoteOn: (midi: number, velocity: number) => void,
    onNoteOff: (midi: number) => void,
  ) {
    this.onNoteOn = onNoteOn;
    this.onNoteOff = onNoteOff;
  }

  async enable(): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      throw new Error("Web MIDI API not supported in this browser.");
    }
    this.midiAccess = await navigator.requestMIDIAccess();
    this.midiAccess.inputs.forEach((input) => this.attachInput(input));
    this.midiAccess.onstatechange = (e) => {
      const { port } = e as MIDIConnectionEvent;
      if (port && port.type === "input" && port.state === "connected") {
        this.attachInput(port as MIDIInput);
      }
    };
  }

  disable(): void {
    if (!this.midiAccess) return;
    this.midiAccess.inputs.forEach((input) => {
      input.onmidimessage = null;
    });
    this.midiAccess.onstatechange = null;
    this.midiAccess = null;
  }

  private attachInput(input: MIDIInput): void {
    input.onmidimessage = (e) => this.handleMessage(e);
  }

  private handleMessage(e: MIDIMessageEvent): void {
    const { data } = e;
    if (!data || data.length < 2) return;
    const [status, midi, velocity = 0] = data;
    const type = status & 0xf0;

    if (type === 0x90 && velocity > 0) {
      this.onNoteOn(midi, velocity);
    } else if (type === 0x80 || (type === 0x90 && velocity === 0)) {
      this.onNoteOff(midi);
    }
  }

  dispose(): void {
    this.disable();
  }
}
