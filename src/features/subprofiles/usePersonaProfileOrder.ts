import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useGridDragReorder } from "./useGridDragReorder";

/** Moves `items[from]` to index `to`, leaving every other card's relative
 *  order unchanged. */
function movedTo<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  if (moved === undefined) return items;
  next.splice(to, 0, moved);
  return next;
}

const orderKeyOf = (personas: SubprofileView[]) =>
  personas.map((persona) => persona.id).join("|");

/** Which of a persona's two move buttons was pressed, matching the buttons'
 *  `data-move` attribute in `ReorderableSideCard`. */
type MoveDirection = "earlier" | "later";

interface MoveFocusTarget {
  personaId: string;
  direction: MoveDirection;
}

/** The persona's shell among the drag container's children, found by the
 *  `data-persona-id` each `ReorderableSideCard` root carries. */
function shellOf(
  container: HTMLElement | null,
  personaId: string,
): HTMLElement | null {
  if (!container) return null;
  for (const child of Array.from(container.children)) {
    if (child instanceof HTMLElement && child.dataset.personaId === personaId) {
      return child;
    }
  }
  return null;
}

/** True when `element` is one of this shell's move buttons and can hold focus. */
function isUsableMoveButton(
  shell: HTMLElement,
  element: Element | null,
): element is HTMLButtonElement {
  return (
    element instanceof HTMLButtonElement &&
    element.dataset.move !== undefined &&
    !element.disabled &&
    shell.contains(element)
  );
}

/** The button focus should land on: the same direction while it is still
 *  enabled, otherwise the persona's other move button. */
function moveButtonFor(shell: HTMLElement, target: MoveFocusTarget) {
  const otherDirection = target.direction === "earlier" ? "later" : "earlier";
  for (const direction of [target.direction, otherDirection]) {
    const button = shell.querySelector(`button[data-move="${direction}"]`);
    if (isUsableMoveButton(shell, button)) return button;
  }
  return null;
}

/**
 * Hands keyboard focus back to the persona that just moved.
 *
 * A move reorders the list, and a focused node that React moves in the DOM
 * can lose focus in some browsers. Reaching either end also disables the
 * button that was pressed, and a disabled button drops focus to `<body>`.
 * So each button move records `{ personaId, direction }`, and after every
 * commit that renders a new order this puts focus back on that persona's
 * button in the same direction, or on its other move button once the first
 * one is disabled. The target outlives that first commit (while focus sits on
 * that persona's move buttons or has dropped to `<body>`), so the optimistic
 * order, the cache write and a server snap-back each get the same treatment.
 *
 * Any `pointerdown`, or focus arriving anywhere else, lets the target go.
 * That is what keeps a pointer drag (which starts with a `pointerdown` on the
 * grip) and a member who has moved on from ever having focus pulled back.
 */
function useMoveFocusReturn(
  containerRef: RefObject<HTMLDivElement | null>,
  orderedPersonas: SubprofileView[],
) {
  const focusTargetRef = useRef<MoveFocusTarget | null>(null);

  useEffect(() => {
    const release = (event: Event) => {
      const target = focusTargetRef.current;
      if (!target) return;
      const shell = shellOf(containerRef.current, target.personaId);
      const isStillOnMoveButton =
        event.type === "focusin" &&
        shell !== null &&
        event.target instanceof Element &&
        isUsableMoveButton(shell, event.target);
      if (!isStillOnMoveButton) focusTargetRef.current = null;
    };
    document.addEventListener("pointerdown", release, true);
    document.addEventListener("focusin", release);
    return () => {
      document.removeEventListener("pointerdown", release, true);
      document.removeEventListener("focusin", release);
    };
  }, [containerRef]);

  useLayoutEffect(() => {
    const target = focusTargetRef.current;
    if (!target) return;
    const shell = shellOf(containerRef.current, target.personaId);
    const button = shell ? moveButtonFor(shell, target) : null;
    if (!shell || !button) {
      focusTargetRef.current = null;
      return;
    }
    // Focus that is still on one of this persona's live move buttons stays put.
    if (isUsableMoveButton(shell, document.activeElement)) return;
    button.focus();
  }, [containerRef, orderedPersonas]);

  return (target: MoveFocusTarget) => {
    focusTargetRef.current = target;
  };
}

/**
 * The working order of the personas listed on a member's profile while they
 * are rearranging them, on the personas dashboard.
 *
 * Reordering is optimistic on purpose: a drag that had to wait for a round
 * trip per step would stutter under the finger. The server list stays the
 * source of truth and re-seeds this whenever it changes, so a refused write
 * simply snaps back on the next read. The re-seed happens DURING render (the
 * "adjust state when a prop changes" pattern) rather than in an effect, so the
 * new order paints in the same commit instead of one frame late.
 *
 * A drag fires one step per neighbour crossed, so committing per step would
 * send a burst of writes for one gesture. The commit is deferred to the moment
 * the drag ends (`draggingIndex` falling back to null); the Move earlier /
 * Move later buttons, which are one discrete move each, commit straight away.
 *
 * Mirrors `useResourceShelfOrder` in communities, over the grid drag hook
 * rather than the row one.
 */
export function usePersonaProfileOrder(
  personas: SubprofileView[],
  commitOrder: (personaIds: string[]) => void,
) {
  const [orderedPersonas, setOrderedPersonas] = useState(personas);
  // The server order this hook last took as its starting point. Compared by
  // value (the joined ids), so a parent re-render with an equivalent list
  // never throws away a drag in progress.
  const [seededOrderKey, setSeededOrderKey] = useState(() =>
    orderKeyOf(personas),
  );
  const serverOrderKey = orderKeyOf(personas);
  if (seededOrderKey !== serverOrderKey) {
    setSeededOrderKey(serverOrderKey);
    setOrderedPersonas(personas);
  }

  // A drag that ends where it started costs nothing. The comparison is
  // against the order the SERVER currently holds, deliberately, rather than
  // against the last order this hook sent.
  //
  // Remembering the last sent order looks equivalent and is not. A write is
  // optimistic, so a refused one rolls the cache back to the previous order
  // while the "last sent" value still names the arrangement that failed. The
  // member, seeing their cards snap back, tries the same move again, and
  // that retry matches the remembered value exactly, so it would be skipped
  // as a no-op. The card would slide into place and nothing would be saved,
  // with no error to explain it, for as long as they kept attempting the one
  // arrangement they wanted. Comparing against the server order instead makes
  // a retry after a failure look like exactly what it is: a change.
  const commit = (next: SubprofileView[]) => {
    if (orderKeyOf(next) === serverOrderKey) return;
    commitOrder(next.map((persona) => persona.id));
  };

  const { containerRef, draggingIndex, gripHandlers } = useGridDragReorder(
    (from, to) => setOrderedPersonas((current) => movedTo(current, from, to)),
  );

  // Commit once per gesture, at the moment the pointer is released.
  const wasDraggingRef = useRef(false);
  useEffect(() => {
    const isDragging = draggingIndex !== null;
    if (wasDraggingRef.current && !isDragging) commit(orderedPersonas);
    wasDraggingRef.current = isDragging;
    // `commit` closes over the current props and is stable in behaviour; the
    // drag state plus the order it settled on are the real inputs here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingIndex, orderedPersonas]);

  const returnFocusAfterMove = useMoveFocusReturn(
    containerRef,
    orderedPersonas,
  );

  /** The keyboard and assistive-tech path: one discrete move, committed now,
   *  with focus handed back to the moved persona's own move button. */
  const moveBy = (index: number, offset: number) => {
    const target = index + offset;
    const movedPersona = orderedPersonas[index];
    if (!movedPersona || target < 0 || target >= orderedPersonas.length) return;
    const next = movedTo(orderedPersonas, index, target);
    returnFocusAfterMove({
      personaId: movedPersona.id,
      direction: offset < 0 ? "earlier" : "later",
    });
    setOrderedPersonas(next);
    commit(next);
  };

  return {
    orderedPersonas,
    containerRef,
    draggingIndex,
    gripHandlers,
    moveBy,
  };
}
