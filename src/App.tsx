import { useCallback, useEffect, useState } from "react";
import FileImport from "./ui/FileImport/FileImport";
import Grid from "./ui/Grid/Grid";
import TransportControls from "./ui/TransportControls/TransportControls";
import GridConfigPanel from "./ui/GridConfigPanel/GridConfigPanel";
import { MidiScheduler } from "./transport/MidiScheduler";
import type { ParsedMidi } from "./types/midi";

interface MidiInfo {
  name: string;
  notes: number;
  duration: number;
  bpm: number;
}

function App() {
  // Created in useEffect so React StrictMode's mount→cleanup→mount cycle
  // produces a fresh scheduler on remount rather than reusing a disposed one.
  const [scheduler, setScheduler] = useState<MidiScheduler | null>(null);
  const [midiInfo, setMidiInfo] = useState<MidiInfo | null>(null);

  useEffect(() => {
    const s = new MidiScheduler();
    setScheduler(s);
    return () => {
      s.dispose();
      setScheduler(null);
    };
  }, []);

  const onMidiLoaded = useCallback(
    (parsed: ParsedMidi, name: string) => {
      scheduler?.load(parsed);
      setMidiInfo({
        name,
        notes: parsed.notes.length,
        duration: parsed.duration,
        bpm: parsed.bpm,
      });
    },
    [scheduler]
  );

  const onCellClick = useCallback(
    (midi: number) => {
      scheduler?.playNote(midi);
    },
    [scheduler]
  );

  return (
    <div className="app">
      <h1>MViSq</h1>
      <FileImport onMidiLoaded={onMidiLoaded} />
      <p className="midi-info">
        {midiInfo ? (
          <>
            {midiInfo.name} &mdash; {midiInfo.notes} notes,{" "}
            {midiInfo.duration.toFixed(1)}s, {midiInfo.bpm.toFixed(0)} BPM
          </>
        ) : (
          "MIDI file not loaded"
        )}
      </p>
      <TransportControls enabled={midiInfo !== null && scheduler !== null} scheduler={scheduler} />
      <Grid onCellClick={onCellClick} />
      <GridConfigPanel />
    </div>
  );
}

export default App;
