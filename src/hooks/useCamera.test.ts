import { describe, expect, it, vi } from 'vitest';
import { stabilizeCameraPreview } from './useCamera';

describe('stabilizeCameraPreview', () => {
  it('forces WebKit to recalculate cover sizing before revealing the camera', async () => {
    const callbacks: FrameRequestCallback[] = [];
    const schedule = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    const video = { style: { objectFit: '' }, offsetWidth: 390 } as HTMLVideoElement;
    const stabilized = stabilizeCameraPreview(video, schedule);

    expect(video.style.objectFit).toBe('none');
    callbacks.shift()?.(0);
    expect(video.style.objectFit).toBe('cover');
    callbacks.shift()?.(16);
    await stabilized;
    expect(schedule).toHaveBeenCalledTimes(2);
  });
});
