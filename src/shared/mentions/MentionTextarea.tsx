import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { IsInsideModalContext } from "../components/ui/modalBodyContext";
import { useAutoGrowTextarea } from "../hooks/useAutoGrowTextarea";
import { getCaretLineRect } from "./caretRect";
import { detectTrigger } from "./detectTrigger";
import { useMentionMemberScope } from "./MentionMemberScopeContext";
import {
  useMentionSuggestions,
  type Suggestion,
} from "./useMentionSuggestions";
import styles from "./MentionTextarea.module.css";

interface MentionTextareaProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  /** Required: the textarea's accessible name. A placeholder disappears the
   *  moment someone starts typing, so every call site has to say what this
   *  particular box writes into (a direct message, a forum reply, and so on). */
  "aria-label": string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  id?: string;
  wrapClassName?: string;
  placement?: "below" | "above";
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  /** Passthrough for a paste directly on this textarea: the chat composer
   *  uses it to detect a pasted FILE (an image copied from another app) and
   *  stage it as an attachment, so the file skips plain text insertion
   *  (DES-204). A paste that carries no file is left
   *  entirely alone: this never changes ordinary text-paste behaviour. */
  onPaste?: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  /** PRD-423: the text inserted for a picked member. A matched Go together
   *  chat inserts `@FirstName` here and maps it back to the member key on
   *  send. Absent keeps `@slug`. */
  formatInsertedMember?: (item: Suggestion) => string;
  /** Focus of the field itself. The chat composer uses it to dismiss whichever
   *  attach/shortcut panel is open once someone starts typing: those panels
   *  now live INSIDE the input pill, so an outside-click never fires for them. */
  onFocus?: () => void;
  /** Grow the box to fit its content, so it never scrolls inside `rows`. The
   *  profile and persona bio fields turn this on, since the plain textareas
   *  they replaced grew this way; the chat and forum composers leave it off
   *  and keep their own fixed, scrolling box. */
  autoGrow?: boolean;
  /** Forwarded to the textarea: the longest text it accepts. */
  maxLength?: number;
  /** Render the suggestion list on `document.body`, placed against the field
   *  by `usePortalMenuPlacement` (below it, flipped above when only that side
   *  has room, otherwise on the roomier side with a shorter, scrolling list,
   *  always clear of the caret line). For a field inside a scrolling dialog
   *  body, whose edge would cut an absolutely placed list off, or under page
   *  layers that paint over one. `placement` has no effect while this is on. */
  shouldPortalMenu?: boolean;
  /** Cmd/Ctrl + Enter while the list is open closes the list unpicked and
   *  goes on to `onKeyDown`, for a host whose own shortcut it is (the
   *  gathering description editors save on it). Off, the open list takes
   *  that Enter as a pick, so a chat composer never sends a half-typed
   *  `@que`. */
  shouldSubmitOnModifierEnter?: boolean;
  /** Injected by `FormField` when this is its child (see the
   *  `formFieldControl` opt-in below). Forwarded onto the textarea. */
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
}

const MAX_SUGGESTIONS = 6;

const SIGIL_BY_KIND: Record<Suggestion["kind"], string> = {
  member: "@",
  community: "c/",
  topic: "#",
  business: "b/",
  event: "e/",
  thread: "t/",
};

/** The text a picked suggestion inserts: `sigil + slug`, or a member as
 *  `formatMember` spells it (PRD-423, a matched Go together chat). */
function insertedText(
  item: Suggestion,
  formatMember?: (item: Suggestion) => string,
): string {
  return item.kind === "member" && formatMember
    ? formatMember(item)
    : `${SIGIL_BY_KIND[item.kind]}${item.slug}`;
}

/** Where a handle or a name splits into words. */
const WORD_BREAK = /[\s\-_.]+/;

/** How closely a qualifying candidate matches the lowercased query, lowest
 *  first: 0 is an exact handle, 1 a handle or name word that starts with the
 *  query, 2 any other match. A roster-scoped `@` (`isNameOnly`) ranks on the
 *  name alone, as it matches on it alone. */
function matchRank(
  item: Suggestion,
  query: string,
  isNameOnly: boolean,
): number {
  const name = item.name.toLowerCase();
  if (isNameOnly ? name === query : item.slug === query) return 0;
  const hasWordPrefix = (text: string) =>
    text.startsWith(query) ||
    text.split(WORD_BREAK).some((word) => word.startsWith(query));
  if (hasWordPrefix(name) || (!isNameOnly && hasWordPrefix(item.slug))) {
    return 1;
  }
  return 2;
}

/** The candidates that contain the query, best ranked first (pool order
 *  within a rank), capped at `MAX_SUGGESTIONS`. Ranking runs before the cap,
 *  so "@ri" offers Rita even when six other names merely contain "ri". */
function rankedMatches(
  pool: readonly Suggestion[],
  query: string,
  isNameOnly: boolean,
): Suggestion[] {
  return pool
    .filter(
      (item) =>
        (!isNameOnly && item.slug.includes(query)) ||
        item.name.toLowerCase().includes(query),
    )
    .map((item) => ({ item, rank: matchRank(item, query, isNameOnly) }))
    .sort((first, second) => first.rank - second.rank)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ item }) => item);
}

/** The open suggestion list: one option per match, picked on mouse down. */
function MentionMenu({
  menuRef,
  className,
  style,
  listboxId,
  optionId,
  matches,
  activeIndex,
  isNameOnly,
  onPick,
}: {
  menuRef: RefObject<HTMLUListElement | null>;
  className: string;
  style?: CSSProperties;
  listboxId: string;
  optionId: (index: number) => string;
  matches: readonly Suggestion[];
  activeIndex: number;
  isNameOnly: boolean;
  onPick: (item: Suggestion) => void;
}) {
  return (
    <ul
      ref={menuRef}
      className={className}
      style={style}
      role="listbox"
      id={listboxId}
    >
      {matches.map((item, index) => (
        // `role="presentation"` strips the <li>'s implicit `listitem`
        // role, which `listbox` does not allow between itself and its
        // options: without it several screen readers report the popup as
        // empty and drop the option count.
        <li key={`${item.kind}-${item.slug}`} role="presentation">
          <button
            type="button"
            role="option"
            id={optionId(index)}
            aria-selected={index === activeIndex}
            className={[styles.option, index === activeIndex && styles.optionOn]
              .filter(Boolean)
              .join(" ")}
            // onMouseDown (not onClick) so it fires before the textarea blur.
            onMouseDown={(event) => {
              event.preventDefault();
              onPick(item);
            }}
          >
            {item.avatarUrl ? (
              <img className={styles.avatar} src={item.avatarUrl} alt="" />
            ) : (
              <span className={styles.avatar} aria-hidden>
                {item.initials}
              </span>
            )}
            <span className={styles.name}>{item.name}</span>
            {!isNameOnly && (
              <span className={styles.handle}>
                {SIGIL_BY_KIND[item.kind]}
                {item.slug}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Breathing room kept between the portalled list and the viewport edge. */
const MENU_VIEWPORT_MARGIN = 12;
/** Gap between the field and the portalled list. */
const MENU_FIELD_GAP = 8;
/** `.menu`'s own `max-height`: the tallest the list grows before scrolling. */
const MENU_MAX_HEIGHT = 260;
/** About two options tall: the shortest list a cramped side is capped to. */
const MENU_MIN_HEIGHT = 100;

interface PortalMenuPlacement {
  /** Inline style for the list: `fixed`, its offsets, width and height cap. */
  style: CSSProperties;
  /** True when the list opens upward, for a bottom `transform-origin`. */
  isFlipped: boolean;
}

interface VerticalAnchor {
  top: number;
  bottom: number;
}

/** What the list hangs from: the whole field box for a field of one or two
 *  lines, the caret's line for a taller one, so the list sits by the line
 *  being typed. The caret line is clamped to the part of the field that is
 *  visible, so a caret scrolled out of view never sends the list off screen. */
function menuAnchor(
  wrap: HTMLElement,
  textarea: HTMLTextAreaElement | null,
): VerticalAnchor {
  const wrapRect = wrap.getBoundingClientRect();
  if (!textarea) return wrapRect;
  const computed = window.getComputedStyle(textarea);
  const lineHeight = parseFloat(computed.lineHeight) || 0;
  const verticalPadding =
    parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
  const isShortField =
    textarea.clientHeight <= lineHeight * 2 + verticalPadding;
  if (isShortField) return wrapRect;
  const fieldRect = textarea.getBoundingClientRect();
  const visibleTop = Math.max(fieldRect.top, 0);
  const visibleBottom = Math.min(fieldRect.bottom, window.innerHeight);
  const caretLine = getCaretLineRect(
    textarea,
    textarea.selectionStart ?? textarea.value.length,
  );
  const clamp = (value: number) =>
    Math.min(Math.max(value, visibleTop), Math.max(visibleTop, visibleBottom));
  return { top: clamp(caretLine.top), bottom: clamp(caretLine.bottom) };
}

/** Below the anchor when the list fits there, above it when only that side
 *  fits, otherwise on the roomier side with its height capped to that side's
 *  free space (never under `MENU_MIN_HEIGHT`). It never covers the caret
 *  line: an upward list hangs from `bottom`, so its own height cannot push it
 *  down. `stickyFlipped` pins the side an open list started on, so filtering
 *  down to fewer rows cannot make it jump across the field. */
function portalMenuPlacement(
  field: DOMRect,
  anchor: VerticalAnchor,
  neededHeight: number,
  stickyFlipped: boolean | null,
): PortalMenuPlacement {
  const viewportHeight = window.innerHeight;
  const spaceBelow =
    viewportHeight - MENU_VIEWPORT_MARGIN - MENU_FIELD_GAP - anchor.bottom;
  const spaceAbove = anchor.top - MENU_FIELD_GAP - MENU_VIEWPORT_MARGIN;
  const isFlipped =
    stickyFlipped ??
    (spaceBelow < neededHeight &&
      (spaceAbove >= neededHeight || spaceAbove > spaceBelow));
  const freeSpace = isFlipped ? spaceAbove : spaceBelow;
  const maxHeight =
    freeSpace >= neededHeight
      ? MENU_MAX_HEIGHT
      : Math.max(Math.floor(freeSpace), MENU_MIN_HEIGHT);
  const vertical: CSSProperties = isFlipped
    ? {
        top: "auto",
        bottom: Math.round(viewportHeight - anchor.top + MENU_FIELD_GAP),
      }
    : { top: Math.round(anchor.bottom + MENU_FIELD_GAP), bottom: "auto" };
  return {
    isFlipped,
    style: {
      position: "fixed",
      ...vertical,
      left: Math.round(field.left),
      right: "auto",
      // The field's width, re-read on every placement so a resize keeps it.
      width: Math.round(field.width),
      maxHeight,
    },
  };
}

/** Placement for the list `shouldPortalMenu` puts on `document.body`, kept
 *  against the field through scrolls, viewport resizes, the field growing,
 *  and the list's own size changing. `null` for the one commit before the
 *  first measurement, while the list stays hidden. */
function usePortalMenuPlacement(
  wrapRef: RefObject<HTMLDivElement | null>,
  menuRef: RefObject<HTMLUListElement | null>,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  isPortalMenuOpen: boolean,
  matchCount: number,
) {
  const [placement, setPlacement] = useState<PortalMenuPlacement | null>(null);
  // What was last published, so a scroll that moves nothing costs a
  // measurement and skips the re-render.
  const lastPlacedRef = useRef("");
  // The side the open list started on, kept until it closes.
  const openSideRef = useRef<boolean | null>(null);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const menu = menuRef.current;
    if (!isPortalMenuOpen) openSideRef.current = null;
    if (!isPortalMenuOpen || !wrap || !menu) return;
    const place = () => {
      // The list's full content height (its scroll height plus borders), up
      // to the CSS cap. `matchCount` re-runs this when the options change.
      const borderHeight = menu.offsetHeight - menu.clientHeight;
      const neededHeight = Math.min(
        menu.scrollHeight + borderHeight,
        MENU_MAX_HEIGHT,
      );
      const next = portalMenuPlacement(
        wrap.getBoundingClientRect(),
        menuAnchor(wrap, textareaRef.current),
        neededHeight,
        openSideRef.current,
      );
      openSideRef.current = next.isFlipped;
      const nextKey = JSON.stringify(next);
      if (nextKey === lastPlacedRef.current) return;
      lastPlacedRef.current = nextKey;
      setPlacement(next);
    };
    place();
    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(wrap);
    resizeObserver.observe(menu);
    window.addEventListener("resize", place);
    // Capture phase: a scrolling dialog body never bubbles to `window`.
    window.addEventListener("scroll", place, true);
    // A dialog still sliding in moves the field by `transform`, which no
    // scroll or resize reports: re-place once its entrance settles.
    window.addEventListener("animationend", place, true);
    window.addEventListener("transitionend", place, true);
    // The caret line moves with typing and with the caret alone.
    const textarea = textareaRef.current;
    textarea?.addEventListener("input", place);
    textarea?.addEventListener("keyup", place);
    textarea?.addEventListener("click", place);
    document.addEventListener("selectionchange", place);
    return () => {
      textarea?.removeEventListener("input", place);
      textarea?.removeEventListener("keyup", place);
      textarea?.removeEventListener("click", place);
      document.removeEventListener("selectionchange", place);
      resizeObserver.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("animationend", place, true);
      window.removeEventListener("transitionend", place, true);
    };
  }, [wrapRef, menuRef, textareaRef, isPortalMenuOpen, matchCount]);
  return placement;
}

export function MentionTextarea(props: MentionTextareaProps) {
  const { value, onChange, textareaRef } = props;
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? internalRef;
  // `?? false` around `props.autoGrow` on purpose: the hook's own `enabled`
  // defaults to true, so passing `undefined` through would silently switch on
  // growing boxes in the chat and forum composers that never asked for one.
  useAutoGrowTextarea(ref, value, props.autoGrow ?? false);
  const { members, communities, topics, businesses, events, threads } =
    useMentionSuggestions();
  const scopedMembers = useMentionMemberScope();
  const isInsideModal = useContext(IsInsideModalContext);
  const [active, setActive] = useState(0);
  const [trigger, setTrigger] =
    useState<ReturnType<typeof detectTrigger>>(null);
  // Stable base id for the aria-combobox wiring below (one per instance).
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const poolByKind: Record<Suggestion["kind"], readonly Suggestion[]> = {
    // A surface may narrow `@` to its own roster (a matched Go together chat,
    // PRD-423); otherwise the whole member directory.
    member: scopedMembers ?? members,
    community: communities,
    topic: topics,
    business: businesses,
    event: events,
    thread: threads,
  };
  const pool: readonly Suggestion[] = trigger ? poolByKind[trigger.kind] : [];
  // PRD-423: a roster-scoped `@` lists and matches first names alone, since
  // a handle can carry a surname. The inserted token is still the handle.
  const isNameOnly = trigger?.kind === "member" && scopedMembers !== null;
  // Lowercase the query once, outside the per-candidate filter.
  const query = trigger ? trigger.query.toLowerCase() : "";
  const matches = trigger ? rankedMatches(pool, query, isNameOnly) : [];
  // The suggestion popup is open exactly when a trigger yielded matches (matches
  // is empty whenever `trigger` is null, so this also implies an active trigger).
  const open = matches.length > 0;

  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const shouldPortalMenu = props.shouldPortalMenu ?? false;
  const portalPlacement = usePortalMenuPlacement(
    wrapRef,
    menuRef,
    ref,
    open && shouldPortalMenu,
    matches.length,
  );

  function recompute(next: string, caret: number) {
    setTrigger(detectTrigger(next.slice(0, caret)));
    setActive(0);
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    onChange(next);
    recompute(next, event.target.selectionStart ?? next.length);
  }

  function insert(item: Suggestion) {
    if (!trigger) return;
    const caret = ref.current?.selectionStart ?? value.length;
    const before = value.slice(0, trigger.start);
    const after = value.slice(caret);
    const token = `${insertedText(item, props.formatInsertedMember)} `;
    const next = `${before}${token}${after}`;
    setTrigger(null);
    // A pick splices text in past the textarea's own `maxLength` check, so a
    // token that would overrun it closes the list and leaves the text as is.
    if (props.maxLength !== undefined && next.length > props.maxLength) return;
    onChange(next);
    // Restore the caret just past the inserted token on the next tick.
    const caretAfter = before.length + token.length;
    requestAnimationFrame(() => {
      const node = ref.current;
      if (node) {
        node.focus();
        node.setSelectionRange(caretAfter, caretAfter);
      }
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!trigger || matches.length === 0) {
      props.onKeyDown?.(event);
      return;
    }
    // Cmd/Ctrl + Enter is the host's own shortcut (save) when it opts in: it
    // closes the list unpicked and goes on to the host's handler.
    if (
      props.shouldSubmitOnModifierEnter &&
      event.key === "Enter" &&
      (event.metaKey || event.ctrlKey)
    ) {
      setTrigger(null);
      props.onKeyDown?.(event);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => (current + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => (current - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const item = matches[active];
      if (item) insert(item);
    } else if (event.key === "Escape") {
      setTrigger(null);
      // Inside a Modal this Escape closes the list alone. The dialog listens
      // for Escape on `document` in the bubble phase, and React handles this
      // event on a container below it (the portal's `body` or the app
      // root), so stopping it here keeps it from reaching the dialog.
      if (isInsideModal) event.stopPropagation();
    }
  }

  const menuProps = {
    menuRef,
    listboxId,
    optionId,
    matches,
    activeIndex: active,
    isNameOnly,
    onPick: insert,
  };

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, props.wrapClassName].filter(Boolean).join(" ")}
    >
      <textarea
        id={props.id}
        ref={ref}
        className={props.className}
        rows={props.rows}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        aria-label={props["aria-label"]}
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        aria-required={props["aria-required"]}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open ? optionId(active) : undefined}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={props.onPaste}
        onFocus={() => props.onFocus?.()}
        onBlur={() => {
          props.onBlur?.();
          requestAnimationFrame(() => setTrigger(null));
        }}
      />
      {open &&
        (shouldPortalMenu ? (
          createPortal(
            <MentionMenu
              {...menuProps}
              className={[
                styles.menu,
                styles.menuPortalled,
                portalPlacement === null && styles.menuUnplaced,
                portalPlacement?.isFlipped && styles.menuFlipped,
              ]
                .filter(Boolean)
                .join(" ")}
              style={portalPlacement?.style}
            />,
            document.body,
          )
        ) : (
          <MentionMenu
            {...menuProps}
            className={[
              styles.menu,
              props.placement === "above" && styles.menuAbove,
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
    </div>
  );
}

/**
 * Opt in to `FormField`'s control wiring: this component forwards the injected
 * `id`/`aria-describedby`/`aria-invalid`/`aria-required` onto its own
 * `<textarea>`, so a `<FormField label helper>` can wrap a `<MentionTextarea>`
 * exactly like it wraps a native `<textarea>`. See FormField's
 * `wireableControl`: without this flag the field's helper text would silently
 * stop describing the control and its `<label>` would point at nothing.
 *
 * Callers inside a FormField must still pass `aria-label`, and must pass the
 * SAME words as the visible label: `aria-label` wins over `<label htmlFor>` for
 * the accessible name, so anything else renames the field for screen readers
 * only.
 */
MentionTextarea.formFieldControl = true;
