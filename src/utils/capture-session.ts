import type { CaptureMode } from '../types/photo';

export const defaultCaptureMode: CaptureMode = 'auto';
export const nextCaptureCount = (count: number) => Math.min(count + 1, 8);
export const isCaptureComplete = (count: number) => count >= 8;
export const canCaptureManually = ({ ready, capturing, count }: { ready: boolean; capturing: boolean; count: number }) =>
  ready && !capturing && !isCaptureComplete(count);
