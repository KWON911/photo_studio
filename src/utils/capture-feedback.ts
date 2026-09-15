export type CaptureFeedback = 'idle' | 'flash' | 'captured';

export function nextCaptureFeedback(current: CaptureFeedback): CaptureFeedback {
  if (current === 'idle') return 'flash';
  if (current === 'flash') return 'captured';
  return 'idle';
}

export function captureProgress(index: number): string {
  return `${String(index + 1).padStart(2, '0')} / 08`;
}
