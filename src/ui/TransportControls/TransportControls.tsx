import { useCallback } from "react";
import { useTransportStore } from "../../store/useTransportStore";
import type { MidiScheduler } from "../../transport/MidiScheduler";
import "./TransportControls.css";

interface TransportControlsProps {
  scheduler: MidiScheduler;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TransportControls({ scheduler }: TransportControlsProps) {
  const state = useTransportStore((s) => s.state);
  const position = useTransportStore((s) => s.position);
  const duration = useTransportStore((s) => s.duration);
  const bpm = useTransportStore((s) => s.bpm);

  const onPlayPause = useCallback(() => {
    if (state === "playing") {
      scheduler.pause();
    } else {
      scheduler.play();
    }
  }, [state, scheduler]);

  const onStop = useCallback(() => {
    scheduler.stop();
  }, [scheduler]);

  const onSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      scheduler.seek(Number(e.target.value));
    },
    [scheduler]
  );

  return (
    <div className="transport">
      <div className="transport__buttons">
        <button className="transport__btn" onClick={onPlayPause}>
          {state === "playing" ? "Pause" : "Play"}
        </button>
        <button className="transport__btn" onClick={onStop}>
          Stop
        </button>
      </div>
      <div className="transport__seek">
        <span className="transport__time">{formatTime(position)}</span>
        <input
          type="range"
          className="transport__slider"
          min={0}
          max={duration}
          step={0.1}
          value={position}
          onChange={onSeek}
        />
        <span className="transport__time">{formatTime(duration)}</span>
      </div>
      <div className="transport__info">
        <span>{bpm.toFixed(0)} BPM</span>
      </div>
    </div>
  );
}
