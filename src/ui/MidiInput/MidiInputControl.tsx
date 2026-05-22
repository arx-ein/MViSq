import { useCallback, useEffect, useRef, useState } from "react";
import { MidiInputHandler } from "../../input/MidiInputHandler";
import type { MidiScheduler } from "../../transport/MidiScheduler";

type MidiPermission = PermissionState | "unknown";

const midiSupported = "requestMIDIAccess" in navigator;

const PERMISSION_LABEL: Record<MidiPermission, string> = {
  granted: "permitted",
  prompt:  "will prompt",
  denied:  "blocked — allow in browser settings",
  unknown: "status unknown",
};

interface MidiInputControlProps {
  scheduler: MidiScheduler | null;
}

export default function MidiInputControl({ scheduler }: MidiInputControlProps) {
  const handlerRef = useRef<MidiInputHandler | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<MidiPermission>("unknown");

  useEffect(() => {
    if (!scheduler) return;
    const handler = new MidiInputHandler(
      (midi, velocity) => scheduler.noteAttack(midi, velocity),
      (midi) => scheduler.noteRelease(midi),
    );
    handlerRef.current = handler;
    return () => {
      handler.dispose();
      handlerRef.current = null;
      setEnabled(false);
    };
  }, [scheduler]);

  useEffect(() => {
    if (!midiSupported) return;
    let status: PermissionStatus | null = null;
    const onChange = () => { if (status) setPermission(status.state); };

    navigator.permissions
      .query({ name: "midi" as PermissionName })
      .then((s) => {
        status = s;
        setPermission(s.state);
        s.addEventListener("change", onChange);
      })
      .catch(() => setPermission("unknown"));

    return () => { status?.removeEventListener("change", onChange); };
  }, []);

  const toggle = useCallback(async () => {
    const handler = handlerRef.current;
    if (!handler || !scheduler) return;
    if (enabled) {
      handler.disable();
      setEnabled(false);
    } else {
      try {
        await scheduler.ensureAudioStarted();
        await handler.enable();
        setEnabled(true);
      } catch (err) {
        console.warn("MIDI input could not be enabled:", err);
      }
    }
  }, [enabled, scheduler]);

  const isDisabled = !midiSupported || !scheduler || permission === "denied";
  const labelTitle = !midiSupported
    ? "Web MIDI API not supported in this browser"
    : permission === "denied"
    ? "MIDI access is blocked — allow it in your browser settings and reload"
    : undefined;

  return (
    <label title={labelTitle}>
      <input
        type="checkbox"
        checked={enabled}
        onChange={() => { void toggle(); }}
        disabled={isDisabled}
      />
      &nbsp;Enable MIDI device input
      {midiSupported && (
        <span style={{ marginLeft: "0.5em", opacity: 0.6, fontSize: "0.85em" }}>
          ({PERMISSION_LABEL[permission]})
        </span>
      )}
    </label>
  );
}
