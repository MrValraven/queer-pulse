import { useEffect, useRef } from "react";

/**
 * A ref that reads true while the component is mounted, so an async handler
 * can skip its setState once the page has gone. Reset on setup, so
 * StrictMode's mount to remount cycle cannot leave it stuck at false.
 */
export function useIsMountedRef() {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
}
