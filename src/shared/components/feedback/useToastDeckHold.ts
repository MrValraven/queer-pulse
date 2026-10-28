import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";

/**
 * Whether the pointer is holding the toast deck open, which spreads it and
 * pauses every countdown.
 *
 * A mouse holds it by resting on the stack: entering spreads, leaving folds.
 * Touch and pen fire enter right before a press and leave right after it, so
 * they would toggle the deck on every tap; they hold it by pressing instead.
 * A press on the folded deck away from its buttons spreads it, and a press
 * anywhere outside the stack folds it again. `release` ends either hold, for
 * when the last toast leaves and no leave event may follow.
 */
export function useToastDeckHold() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPointerOverStack, setIsPointerOverStack] = useState(false);
  const [isSpreadByPress, setIsSpreadByPress] = useState(false);

  useEffect(() => {
    if (!isSpreadByPress) return;
    const foldOnOutsidePress = (event: globalThis.PointerEvent) => {
      const container = containerRef.current;
      const target = event.target;
      if (container && target instanceof Node && container.contains(target))
        return;
      setIsSpreadByPress(false);
    };
    document.addEventListener("pointerdown", foldOnOutsidePress, true);
    return () =>
      document.removeEventListener("pointerdown", foldOnOutsidePress, true);
  }, [isSpreadByPress]);

  const release = useCallback(() => {
    setIsPointerOverStack(false);
    setIsSpreadByPress(false);
  }, []);

  const pointerHandlers = {
    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") setIsPointerOverStack(true);
    },
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") setIsPointerOverStack(false);
    },
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse") return;
      const target = event.target;
      if (target instanceof Element && target.closest("button")) return;
      setIsSpreadByPress(true);
    },
  };

  return {
    containerRef,
    isHeld: isPointerOverStack || isSpreadByPress,
    pointerHandlers,
    release,
  };
}
