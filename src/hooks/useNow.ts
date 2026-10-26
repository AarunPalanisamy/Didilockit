import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Current time, re-rendering exactly on each minute boundary (no per-second
 * renders) and immediately when the app returns to the foreground.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const msToNextMinute = 60_000 - (Date.now() % 60_000) + 50;
      timeout = setTimeout(() => {
        setNow(Date.now());
        schedule();
      }, msToNextMinute);
    };
    schedule();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        clearTimeout(timeout);
        setNow(Date.now());
        schedule();
      }
    });

    return () => {
      clearTimeout(timeout);
      sub.remove();
    };
  }, []);

  return now;
}
