export function CaptureCountdownOverlay({ value }: { value: number }) {
  return (
    <div className="capture-countdown-overlay" aria-live="assertive">
      <strong className="capture-countdown-text">{value === -1 ? 'READY' : value}</strong>
    </div>
  );
}
