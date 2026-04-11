import { useCallback, useState, type DragEvent } from "react";
import { parseMidiFile } from "../../midi/parser";
import type { ParsedMidi } from "../../types/midi";
import "./FileImport.css";

interface FileImportProps {
  onMidiLoaded: (parsed: ParsedMidi, fileName: string) => void;
}

export default function FileImport({ onMidiLoaded }: FileImportProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const parsed = await parseMidiFile(file);
        onMidiLoaded(parsed, file.name);
      } catch {
        setError("Failed to parse MIDI file. Please try a valid .mid file.");
      }
    },
    [onMidiLoaded]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      className={`file-import ${dragging ? "file-import--dragging" : ""}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <p>Drop a MIDI file here or</p>
      <label className="file-import__button">
        Browse
        <input
          type="file"
          accept=".mid,.midi"
          onChange={onInputChange}
          hidden
        />
      </label>
      {error && <p className="file-import__error">{error}</p>}
    </div>
  );
}
