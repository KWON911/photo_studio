import { useCallback, useEffect, useRef, useState } from 'react';
import type { Settings } from '../types/photo';

const stopStream = (mediaStream: MediaStream | null) => {
  mediaStream?.getTracks().forEach((track) => track.stop());
};

type FrameScheduler = (callback: FrameRequestCallback) => number;

export const stabilizeCameraPreview = (
  video: HTMLVideoElement,
  scheduleFrame: FrameScheduler = requestAnimationFrame,
) => new Promise<void>((resolve) => {
  // WebKit can keep a portrait MediaStream in its intrinsic, letterboxed size.
  // Toggling object-fit after playback forces a fresh media-layer layout.
  video.style.objectFit = 'none';
  scheduleFrame(() => {
    void video.offsetWidth;
    video.style.objectFit = 'cover';
    scheduleFrame(() => resolve());
  });
});

export function useCamera(settings: Settings) {
  const ref = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const requestGeneration = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const stop = useCallback(() => {
    requestGeneration.current += 1;
    stopStream(stream.current);
    stream.current = null;
    if (ref.current) ref.current.srcObject = null;
    setReady(false);
  }, []);

  const start = useCallback(async () => {
    const generation = requestGeneration.current + 1;
    requestGeneration.current = generation;
    stopStream(stream.current);
    stream.current = null;
    setReady(false);
    setError(null);

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: { ideal: settings.facingMode },
        },
        audio: false,
      });

      if (generation !== requestGeneration.current || !ref.current) {
        stopStream(nextStream);
        return;
      }

      stream.current = nextStream;
      ref.current.setAttribute('webkit-playsinline', 'true');
      ref.current.srcObject = nextStream;
      await ref.current.play();
      await stabilizeCameraPreview(ref.current);

      if (generation !== requestGeneration.current) {
        stopStream(nextStream);
        if (ref.current?.srcObject === nextStream) ref.current.srcObject = null;
        return;
      }
      setReady(true);
    } catch {
      if (generation === requestGeneration.current) {
        setError('카메라 접근 권한이 필요합니다.');
      }
    }
  }, [settings.facingMode]);

  useEffect(() => () => stop(), [stop]);

  return { ref, error, ready, start, stop };
}
