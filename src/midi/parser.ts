import { Midi } from "@tonejs/midi";
import type { ParsedMidi, NoteEvent } from "../types/midi";

export async function parseMidiFile(file: File): Promise<ParsedMidi> {
  const buffer = await file.arrayBuffer();
  const midi = new Midi(buffer);

  const notes: NoteEvent[] = [];

  midi.tracks.forEach((track, trackIndex) => {
    track.notes.forEach((note) => {
      notes.push({
        midi: note.midi,
        name: note.name,
        velocity: Math.round(note.velocity * 127),
        time: note.time,
        duration: note.duration,
        channel: track.channel,
        track: trackIndex,
      });
    });
  });

  notes.sort((a, b) => a.time - b.time);

  const bpm = midi.header.tempos.length > 0 ? midi.header.tempos[0].bpm : 120;

  const timeSig = midi.header.timeSignatures.length > 0
    ? midi.header.timeSignatures[0].timeSignature
    : [4, 4];

  const trackNames = midi.tracks.map(
    (t, i) => t.name || `Track ${i + 1}`
  );

  return {
    notes,
    duration: midi.duration,
    bpm,
    trackNames,
    timeSignature: [timeSig[0], timeSig[1]] as [number, number],
  };
}
