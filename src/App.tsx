import { useCallback, useEffect, useRef, useState } from "react";
import FileImport from "./ui/FileImport/FileImport";
import Grid from "./ui/Grid/Grid";
import TransportControls from "./ui/TransportControls/TransportControls";
import GridConfigPanel from "./ui/GridConfigPanel/GridConfigPanel";
import { MidiScheduler } from "./transport/MidiScheduler";
import { MidiInputHandler } from "./input/MidiInputHandler";
import type { ParsedMidi } from "./types/midi";

interface MidiInfo {
  name: string;
  notes: number;
  duration: number;
  bpm: number;
}

type MidiPermission = PermissionState | "unknown";

const midiSupported = "requestMIDIAccess" in navigator;

const MIDI_PERMISSION_LABEL: Record<MidiPermission, string> = {
  granted:  "permitted",
  prompt:   "will prompt",
  denied:   "blocked — allow in browser settings",
  unknown:  "status unknown",
};

function App() {
  // Created in useEffect so React StrictMode's mount→cleanup→mount cycle
  // produces a fresh scheduler on remount rather than reusing a disposed one.
  const [scheduler, setScheduler] = useState<MidiScheduler | null>(null);
  const [midiInfo, setMidiInfo] = useState<MidiInfo | null>(null);
  const midiHandlerRef = useRef<MidiInputHandler | null>(null);
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiPermission, setMidiPermission] = useState<MidiPermission>("unknown");

  useEffect(() => {
    const s = new MidiScheduler();
    setScheduler(s);
    return () => {
      s.dispose();
      setScheduler(null);
    };
  }, []);

  useEffect(() => {
    if (!scheduler) return;
    const handler = new MidiInputHandler(
      (midi, velocity) => scheduler.noteAttack(midi, velocity),
      (midi) => scheduler.noteRelease(midi),
    );
    midiHandlerRef.current = handler;
    return () => {
      handler.dispose();
      midiHandlerRef.current = null;
      setMidiEnabled(false);
    };
  }, [scheduler]);

  useEffect(() => {
    if (!midiSupported) return;
    let status: PermissionStatus | null = null;
    const onChange = () => { if (status) setMidiPermission(status.state); };

    navigator.permissions
      .query({ name: "midi" as PermissionName })
      .then((s) => {
        status = s;
        setMidiPermission(s.state);
        s.addEventListener("change", onChange);
      })
      .catch(() => setMidiPermission("unknown"));

    return () => { status?.removeEventListener("change", onChange); };
  }, []);

  const toggleMidi = useCallback(async () => {
    const handler = midiHandlerRef.current;
    if (!handler || !scheduler) return;
    if (midiEnabled) {
      handler.disable();
      setMidiEnabled(false);
    } else {
      try {
        await scheduler.ensureAudioStarted();
        await handler.enable();
        setMidiEnabled(true);
      } catch (err) {
        console.warn("MIDI input could not be enabled:", err);
      }
    }
  }, [midiEnabled, scheduler]);

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

  const onNoteOn = useCallback(
    (midi: number) => {
      scheduler?.noteAttack(midi);
    },
    [scheduler]
  );

  const onNoteOff = useCallback(
    (midi: number) => {
      scheduler?.noteRelease(midi);
    },
    [scheduler]
  );

  const midiCheckboxDisabled = !midiSupported || !scheduler || midiPermission === "denied";
  const midiLabelTitle = !midiSupported
    ? "Web MIDI API not supported in this browser"
    : midiPermission === "denied"
    ? "MIDI access is blocked — allow it in your browser settings and reload"
    : undefined;

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
      <Grid onNoteOn={onNoteOn} onNoteOff={onNoteOff} />
      <label title={midiLabelTitle}>
        <input
          type="checkbox"
          checked={midiEnabled}
          onChange={() => { void toggleMidi(); }}
          disabled={midiCheckboxDisabled}
        />
        &nbsp;Enable MIDI device input
        {midiSupported && (
          <span style={{ marginLeft: "0.5em", opacity: 0.6, fontSize: "0.85em" }}>
            ({MIDI_PERMISSION_LABEL[midiPermission]})
          </span>
        )}
      </label>
      <hr />
      <GridConfigPanel />
      <footer>
        <a href="https://github.com/arx-ein/MViSq">arx-ein/MViSq</a>
        : MIDI Visualizer in Squares
      </footer>
    </div>
  );
}

export default App;
