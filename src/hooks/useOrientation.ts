import { useState, useEffect, useRef, useCallback } from 'react';

export type OrientationState = {
  heading: number;
  tiltX: number;
  tiltY: number;
};

const SMOOTHING = 0.18;

function shortestAngleDiff(from: number, to: number): number {
  let diff = (to - from) % 360;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

export function useOrientation(): OrientationState & {
  isSupported: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
} {
  const [heading, setHeading] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const headingRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ heading: 0, tiltX: 0, tiltY: 0 });

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setIsSupported(false);
      return;
    }

    const needsPermission =
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (!needsPermission) {
      setPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    if (!permissionGranted || !isSupported) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha, beta, gamma } = event;
      if (alpha === null || beta === null || gamma === null) return;

      let headingDeg = 360 - alpha;
      if (window.orientation === -90) {
        headingDeg = (headingDeg + 270) % 360;
      } else if (window.orientation === 90) {
        headingDeg = (headingDeg + 90) % 360;
      }
      targetRef.current.heading = (headingDeg + 360) % 360;
      targetRef.current.tiltX = Math.max(-90, Math.min(90, gamma));
      targetRef.current.tiltY = Math.max(-90, Math.min(90, beta));
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation);
    window.addEventListener('deviceorientation', handleOrientation);

    const animate = () => {
      const t = targetRef.current;
      headingRef.current =
        (headingRef.current + shortestAngleDiff(headingRef.current, t.heading) * SMOOTHING + 360) % 360;
      setHeading(headingRef.current);
      setTiltX(t.tiltX);
      setTiltY(t.tiltY);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [permissionGranted, isSupported]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') setPermissionGranted(true);
      } catch (error) {
        console.error('Error requesting permission:', error);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);

  return { heading, tiltX, tiltY, isSupported, permissionGranted, requestPermission };
}
