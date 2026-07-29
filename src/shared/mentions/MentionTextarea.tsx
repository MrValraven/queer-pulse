import { useId, useRef, useState, type RefObject } from "react";
import { detectTrigger } from "./detectTrigger";
import { useMentionSuggestions, type Suggestion } from "./useMentionSuggestions";
import styles from "./MentionTextarea.module.css";

interface MentionTextareaProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  "aria-label"?: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  id?: string;
  wrapClassName?: string;
  placement?: "below" | "above";
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
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

export function MentionTextarea(props: MentionTextareaProps) {
  const { value, onChange, textareaRef } = props;
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? internalRef;
  const { members, communities, topics, businesses, events, threads } =
    useMentionSuggestions();
  const [active, setActive] = useState(0);
  const [trigger, setTrigger] = useState<ReturnType<typeof detectTrigger>>(null);
  // Stable base id for the aria-combobox wiring below (one per instance).
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const poolByKind: Record<Suggestion["kind"], Suggestion[]> = {
    member: members,
    community: communities,
    topic: topics,
    business: businesses,
    event: events,
    thread: threads,
  };
  const pool: Suggestion[] = trigger ? poolByKind[trigger.kind] : [];
  // Lowercase the query once, not per candidate.
  const query = trigger ? trigger.query.toLowerCase() : "";
  const matches = trigger
    ? pool
        .filter(
          (item) =>
            item.slug.includes(query) ||
            item.name.toLowerCase().includes(query),
        )
        .slice(0, MAX_SUGGESTIONS)
    : [];
  // The suggestion popup is open exactly when a trigger yielded matches (matches
  // is empty whenever `trigger` is null, so this also implies an active trigger).
  const open = matches.length > 0;

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
    const sigil = SIGIL_BY_KIND[item.kind];
    const before = value.slice(0, trigger.start);
    const after = value.slice(caret);
    const token = `${sigil}${item.slug} `;
    const next = `${before}${token}${after}`;
    onChange(next);
    setTrigger(null);
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
    }
  }

  return (
    <div className={[styles.wrap, props.wrapClassName].filter(Boolean).join(" ")}>
      <textarea
        id={props.id}
        ref={ref}
        className={props.className}
        rows={props.rows}
        placeholder={props.placeholder}
        aria-label={props["aria-label"]}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open ? optionId(active) : undefined}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          props.onBlur?.();
          requestAnimationFrame(() => setTrigger(null));
        }}
      />
      {open && (
        <ul
          className={[styles.menu, props.placement === "above" && styles.menuAbove]
            .filter(Boolean)
            .join(" ")}
          role="listbox"
          id={listboxId}
        >
          {matches.map((item, index) => (
            <li key={`${item.kind}-${item.slug}`}>
              <button
                type="button"
                role="option"
                id={optionId(index)}
                aria-selected={index === active}
                className={[styles.option, index === active && styles.optionOn]
                  .filter(Boolean)
                  .join(" ")}
                // onMouseDown (not onClick) so it fires before the textarea blur.
                onMouseDown={(event) => {
                  event.preventDefault();
                  insert(item);
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
                <span className={styles.handle}>
                  {SIGIL_BY_KIND[item.kind]}
                  {item.slug}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
