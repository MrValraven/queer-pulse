import { type ReactNode, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useFormat } from "../../i18n/format";
import styles from "./ChipSelect.module.css";
import { GlideChip } from "./GlideChip";
import { PresenceChip } from "./PresenceChip";
import { RollingNumber } from "./RollingNumber";
import { useChipMotion } from "./useChipMotion";
import { useRefineGlide } from "./useRefineGlide";

/** The plain row and chip elements, typed as their motion versions so one
 *  JSX tag serves both. Only a gliding or presence-animated row renders the
 *  motion ones (anywhere else a motion element per chip would change
 *  nothing), and the glide props spread on the tag are empty whenever it is
 *  plain, so a plain element only ever receives HTML props. */
const PLAIN_ROW = "div" as unknown as typeof m.div;
const PLAIN_CHIP = "button" as unknown as typeof m.button;

export interface ChipOption {
  value: string;
  label?: ReactNode;
  /** Availability count shown as a trailing badge (`ChipSelect` only). `0`
   *  renders the chip dimmed and unpickable — unless it is already selected,
   *  which must always stay clickable or a member could trap themselves in a
   *  filter they cannot undo. */
  count?: number;
  /** Marks the chip dimmed and unpickable for a reason the caller knows and
   *  `count` cannot carry, such as a count rendered inside the label. Same
   *  rule as a zero `count`: a selected chip stays clickable whatever this
   *  says (`ChipSelect` only). */
  isUnavailable?: boolean;
  /** Accessible name for the chip. Required alongside `count`: the badge is
   *  `aria-hidden`, so without this a screen reader hears the bare label and
   *  loses the number entirely (and with the badge exposed it would hear
   *  "Design 12", which reads as a quantity of Designs). */
  ariaLabel?: string;
}

/** Active-chip colour: plum fill (default) or jade tint. */
export type ChipTone = "plum" | "jade";
/** Surface the chips sit on: light cream pages (default) or dark/plum surfaces. */
export type ChipTint = "light" | "dark";
/** Chip height: the compact default (default) or a 44px touch target
 *  (`touch`) for pickers where taps are the primary input. */
export type ChipSize = "default" | "touch";

function normalize(options: readonly (string | ChipOption)[]): ChipOption[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : { label: o.value, ...o },
  );
}

function chipClass(
  on: boolean,
  tone: ChipTone,
  tint: ChipTint,
  isTouchSized = false,
) {
  return [
    styles.chip,
    tint === "dark" && styles.dark,
    tone === "jade" && styles.tone_jade,
    on && styles.chipOn,
    isTouchSized && styles.touch,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Naming the `role="group"`. A group with no accessible name is announced as a
 * bare "group", so a screen-reader user hears the chips but not what they
 * filter. Prefer `labelledBy` pointing at the heading/label already on screen
 * over `label`, which duplicates that text into the accessibility tree.
 */
interface ChipGroupLabelling {
  /** Accessible name for the chip group, when nothing visible labels it. */
  label?: string;
  /** `id` of the visible heading/label that names this group. Wins over `label`. */
  labelledBy?: string;
}

interface FilterChipsProps extends ChipGroupLabelling {
  options: readonly (string | ChipOption)[];
  value: string;
  onChange: (value: string) => void;
  tone?: ChipTone;
  tint?: ChipTint;
  /** `"touch"` raises every chip to a 44px min-height, like `ChipSelect`.
   *  Default unchanged. */
  size?: ChipSize;
  className?: string;
}

/**
 * Single-select chip row (one active value at a time): the interactive
 * filter/segment pattern reimplemented across cinema, communities, marketing,
 * resources… `aria-pressed` reflects the active chip. No tick (single-select).
 * Inside a `RefinePanel` the chips glide when one changes width.
 */
export function FilterChips({
  options,
  value,
  onChange,
  tone = "plum",
  tint = "light",
  size = "default",
  className,
  label,
  labelledBy,
}: FilterChipsProps) {
  const glide = useRefineGlide();
  const Row = glide.isGliding ? m.div : PLAIN_ROW;
  const Chip = glide.isGliding ? m.button : PLAIN_CHIP;
  return (
    <Row
      className={[styles.row, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      {...glide.row}
    >
      {normalize(options).map((option) => (
        <Chip
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          className={chipClass(
            value === option.value,
            tone,
            tint,
            size === "touch",
          )}
          onClick={() => onChange(option.value)}
          {...glide.chip}
        >
          {option.label}
        </Chip>
      ))}
    </Row>
  );
}

interface ChipSelectProps extends ChipGroupLabelling {
  options: readonly (string | ChipOption)[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  /** Show a leading tick on selected chips (default true). Set false to match tick-less designs. */
  tick?: boolean;
  tone?: ChipTone;
  tint?: ChipTint;
  /** `"touch"` raises every chip to a 44px min-height. Opt in only where
   *  taps are the primary input; other callers keep the compact default. */
  size?: ChipSize;
  className?: string;
  /** Ceiling on how many chips may be on at once. Once it is reached the
   *  unselected chips go unpickable, so the limit is visible before it is hit
   *  instead of a click that silently does nothing. Selected chips always stay
   *  clickable, or the picker would lock at the cap. */
  maxSelected?: number;
  /** Put an id on the group. Also makes the group programmatically focusable
   *  (`tabIndex={-1}`, so it never enters the tab order), which is what lets a
   *  "still missing" checklist send focus here the way it sends focus to a
   *  required input. */
  id?: string;
  /** Chips that join or leave the options pop in and out (`useChipMotion`),
   *  and the others glide to their new places. A tick grows in and pushes
   *  the chips after it along. For a row whose options change under the
   *  member, such as the work picker's roles. Off by default, so every
   *  other row keeps its instant behaviour; it wins over a `RefinePanel`
   *  glide. */
  isPresenceAnimated?: boolean;
  /** Only read with `isPresenceAnimated`. True (the default) glides the
   *  chips to their new places and pops chips in and out with a scale.
   *  False makes the chips land on their new places at once, with chips
   *  coming and going only fading, for a change the member did not point
   *  at, such as a keystroke in a search that filters the row. It can flip
   *  between renders: the chips stay mounted and focus stays put. */
  shouldGlide?: boolean;
}

/**
 * Multi-select chip row backed by a `Set`. Selected chips show a tick by
 * default. Pair with `useChipSet` for the state. Inside a `RefinePanel` the
 * tick pops in, and the chips after it glide over as it makes room.
 *
 * With `isPresenceAnimated` the row is a `layoutRoot` (with `layout` beside
 * it, which a root needs to be measured), so the glide is measured inside the
 * row and the row moving with the page never flings a chip across it. The row
 * then sits in its own `AnimatePresence`: a `layout` element mounted inside a
 * modal, `Collapse` or crossfade registers with that parent's presence, and
 * one that unmounts before the parent leaves would keep the parent's exit
 * from ever finishing.
 */
export function ChipSelect({
  options,
  selected,
  onToggle,
  tick = true,
  tone = "plum",
  tint = "light",
  size = "default",
  className,
  label,
  labelledBy,
  maxSelected,
  id,
  isPresenceAnimated = false,
  shouldGlide = true,
}: ChipSelectProps) {
  const fmt = useFormat();
  const glide = useRefineGlide();
  const { transition } = useChipMotion();
  const rowTransition = shouldGlide
    ? transition
    : { ...transition, layout: { duration: 0 } };
  const isAtCap = maxSelected !== undefined && selected.size >= maxSelected;
  const isTouchSized = size === "touch";
  const Row = isPresenceAnimated || glide.isGliding ? m.div : PLAIN_ROW;
  const normalizedOptions = normalize(options);
  // The chip values on screen and, among those, which are ticked: a
  // presence row and its chips only need to re-measure when one of those
  // two sets changes, so a keystroke that leaves both the same (retyping a
  // letter already in the query, for one) skips a fresh layout pass across
  // every visible chip. While the row glides, every chip re-measures on the
  // renders where they do change, so the chips that stay glide to their new
  // places (`useGlideLayoutDependency`).
  const chipValuesKey = normalizedOptions
    .map((option) => option.value)
    .join(",");
  const tickedChipValuesKey = tick
    ? normalizedOptions
        .filter((option) => selected.has(option.value))
        .map((option) => option.value)
        .join(",")
    : "";
  const rowLayoutDependency = useGlideLayoutDependency(
    `${chipValuesKey}::${tickedChipValuesKey}`,
    shouldGlide,
  );
  const shouldChipsPopIn = useHaveChipValuesChanged(chipValuesKey);
  const chips = normalizedOptions.map((option) => {
    const isOn = selected.has(option.value);
    // Either nobody is left to find under this chip, or the picker is
    // already full and this is not one of the chips on. Disabled rather
    // than merely dimmed, so the affordance matches the outcome, but never
    // while it is selected, or unticking it would be impossible.
    const isUnavailable =
      (option.count === 0 || option.isUnavailable === true || isAtCap) && !isOn;
    const isTicked = tick && isOn;
    const chipClassName = [
      chipClass(isOn, tone, tint, isTouchSized),
      isUnavailable && styles.chipEmpty,
    ]
      .filter(Boolean)
      .join(" ");
    const content = (
      <>
        {option.label}
        {option.count !== undefined && (
          <span className={styles.chipCount} aria-hidden>
            <RollingNumber
              value={fmt.number(option.count)}
              numericValue={option.count}
            />
          </span>
        )}
      </>
    );
    if (isPresenceAnimated) {
      return (
        <PresenceChip
          key={option.value}
          isOn={isOn}
          isTicked={isTicked}
          isDisabled={isUnavailable}
          ariaLabel={option.ariaLabel}
          className={chipClassName}
          onToggle={() => onToggle(option.value)}
          shouldPopIn={shouldChipsPopIn}
          shouldGlide={shouldGlide}
          // See `rowLayoutDependency` above.
          layoutDependency={rowLayoutDependency}
        >
          {content}
        </PresenceChip>
      );
    }
    return (
      <GlideChip
        key={option.value}
        isOn={isOn}
        isTicked={isTicked}
        isUnavailable={isUnavailable}
        ariaLabel={option.ariaLabel}
        className={chipClassName}
        onToggle={() => onToggle(option.value)}
        glide={glide}
      >
        {content}
      </GlideChip>
    );
  });
  const row = (
    <Row
      key="row"
      id={id}
      tabIndex={id ? -1 : undefined}
      className={[
        styles.row,
        isPresenceAnimated && styles.rowPresence,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      {...(isPresenceAnimated
        ? {
            layout: true,
            layoutRoot: true,
            layoutDependency: rowLayoutDependency,
            transition: rowTransition,
          }
        : glide.row)}
    >
      {isPresenceAnimated ? (
        // No `initial={false}` here: a chip marked that way skips its
        // entrance for good, so each chip carries its own `initial`
        // (`shouldPopIn`). `custom` tells a leaving chip how the row moves.
        <AnimatePresence mode="popLayout" custom={shouldGlide}>
          {chips}
        </AnimatePresence>
      ) : (
        chips
      )}
    </Row>
  );
  return isPresenceAnimated ? (
    <AnimatePresence initial={false}>{row}</AnimatePresence>
  ) : (
    row
  );
}

/**
 * False while the row still shows the chips it opened with, and true from the
 * first render where they change, for good. Its chips' `shouldPopIn`: the
 * chips a row opens with show at once, and every chip after that pops in,
 * including one of the first chips coming back after it left. Stored during
 * render, so the render that first changes the chips already reads true.
 */
function useHaveChipValuesChanged(chipValuesKey: string) {
  const [firstChipValuesKey] = useState(chipValuesKey);
  const [haveChanged, setHaveChanged] = useState(false);
  const isDifferent = chipValuesKey !== firstChipValuesKey;
  if (isDifferent && !haveChanged) setHaveChanged(true);
  return haveChanged || isDifferent;
}

/**
 * The `layoutDependency` a presence row and its chips share. While the row
 * glides it is `rowSignature`, so every chip re-measures on the renders where
 * the chips on screen or their ticks change. While it reflows at once
 * (`shouldGlide` false) it holds the last gliding value, so no chip is
 * measured at all and the chips simply take their new places in layout. The
 * first gliding render after that measures again from where the chips sit.
 */
function useGlideLayoutDependency(rowSignature: string, shouldGlide: boolean) {
  const [glidingSignature, setGlidingSignature] = useState(rowSignature);
  if (shouldGlide && rowSignature !== glidingSignature) {
    setGlidingSignature(rowSignature);
  }
  return shouldGlide ? rowSignature : glidingSignature;
}
