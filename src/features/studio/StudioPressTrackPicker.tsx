import { AnimatePresence } from "motion/react";
import { useId, useLayoutEffect, useRef } from "react";
import { FiArrowDown, FiArrowUp, FiX } from "react-icons/fi";
import { Collapse, CollapseListItem, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLoadState } from "./api/studioLoadState";
import { STUDIO_PRESS } from "./api/studio.types";
import { StudioLoadError } from "./StudioLoadStates";
import {
  moveItem,
  pressTrackRows,
  type PressTrackListStatus,
  type PressTrackOption,
  type PressTrackRow,
} from "./studioPressEdit";
import styles from "./StudioPressEdit.module.css";

/** Where focus goes after a change: a row's button by key, else the add
 *  control, else the fallback key (the add control can be disabled). When
 *  none is left, the tracks' Try again takes it, else the hint line. */
interface PendingFocus {
  key: string;
  fallbackKey: string | null;
}

const ADD_CONTROL = "add";

/** The row's buttons: Move up and Move down for a playable pick, Remove for
 *  any pick that has an answer. A pick still loading shows none. */
function TrackRowButtons({
  row,
  index,
  count,
  title,
  register,
  onMove,
  onRemove,
}: {
  row: PressTrackRow;
  index: number;
  count: number;
  title: string;
  register: (key: string) => (element: HTMLButtonElement | null) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  if (row.state === "pending") return null;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return (
    <>
      {row.state === "playable" && (
        <>
          <button
            ref={register(`${row.id}:up`)}
            type="button"
            className={styles.iconButton}
            aria-disabled={isFirst || undefined}
            aria-label={t("studio:pressEdit.moveUp", { title })}
            onClick={() => {
              if (!isFirst) onMove(-1);
            }}
          >
            <FiArrowUp aria-hidden />
          </button>
          <button
            ref={register(`${row.id}:down`)}
            type="button"
            className={styles.iconButton}
            aria-disabled={isLast || undefined}
            aria-label={t("studio:pressEdit.moveDown", { title })}
            onClick={() => {
              if (!isLast) onMove(1);
            }}
          >
            <FiArrowDown aria-hidden />
          </button>
        </>
      )}
      <button
        ref={register(`${row.id}:remove`)}
        type="button"
        className={styles.iconButton}
        aria-label={
          row.state === "playable"
            ? t("studio:pressEdit.removeTrack", { title })
            : t("studio:pressEdit.removeUnavailableTrack", {
                number: index + 1,
              })
        }
        onClick={onRemove}
      >
        <FiX aria-hidden />
      </button>
    </>
  );
}

/** Up to five best tracks in the chosen order. A move keeps focus on the
 *  pressed button; Remove moves it to the next row, else the add control. */
export function StudioPressTrackPicker({
  trackIds,
  options,
  addableOptions,
  status,
  tracksLoadState,
  refusalKey,
  onChange,
}: {
  trackIds: string[];
  /** Every playable track the picker can name. */
  options: PressTrackOption[];
  /** The persona's playable tracks not chosen yet. */
  addableOptions: PressTrackOption[];
  status: PressTrackListStatus;
  tracksLoadState: StudioLoadState;
  /** The server refused a pick (422); the stale one reads unavailable. */
  refusalKey: string | null;
  onChange: (trackIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const addId = useId();
  const addLabelId = useId();
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>());
  const focusRef = useRef<PendingFocus | null>(null);
  const loadErrorRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const rows = pressTrackRows(trackIds, options, status);
  const isFull = trackIds.length >= STUDIO_PRESS.featuredMax;

  useLayoutEffect(() => {
    const pending = focusRef.current;
    if (!pending) return;
    focusRef.current = null;
    const elementOf = (key: string | null) => {
      if (key === ADD_CONTROL) {
        const trigger = document.getElementById(addId);
        return trigger instanceof HTMLButtonElement && !trigger.disabled
          ? trigger
          : null;
      }
      return key ? (buttonsRef.current.get(key) ?? null) : null;
    };
    const retryButton =
      loadErrorRef.current?.querySelector<HTMLButtonElement>("button") ?? null;
    (
      elementOf(pending.key) ??
      elementOf(pending.fallbackKey) ??
      retryButton ??
      hintRef.current
    )?.focus();
  });

  const register = (key: string) => (element: HTMLButtonElement | null) => {
    if (element) buttonsRef.current.set(key, element);
    else buttonsRef.current.delete(key);
  };

  const removeAt = (index: number) => {
    const hasButtons = (row: PressTrackRow | undefined) =>
      row !== undefined && row.state !== "pending";
    const nextRow = rows.slice(index + 1).find(hasButtons);
    const previousRow = rows.slice(0, index).reverse().find(hasButtons);
    focusRef.current = {
      key: nextRow ? `${nextRow.id}:remove` : ADD_CONTROL,
      fallbackKey: previousRow ? `${previousRow.id}:remove` : null,
    };
    onChange(trackIds.filter((_, position) => position !== index));
  };

  return (
    <div className={styles.picker}>
      <p ref={hintRef} tabIndex={-1} className={styles.hint}>
        {trackIds.length === 0
          ? t("studio:pressEdit.tracksFallbackHint")
          : t("studio:pressEdit.tracksHint", { max: STUDIO_PRESS.featuredMax })}
      </p>
      <ol className={styles.chosen}>
        <AnimatePresence initial={false}>
          {rows.map((row, index) => {
            const title =
              row.state === "playable"
                ? row.option.title
                : row.state === "pending"
                  ? t("studio:states.loadingLabel")
                  : t("studio:pressEdit.trackUnavailable");
            return (
              <CollapseListItem key={row.id}>
                <div
                  className={styles.chosenRow}
                  data-state={row.state}
                  aria-busy={row.state === "pending" || undefined}
                >
                  <span className={styles.chosenText}>
                    <span className={styles.chosenTitle}>
                      {`${index + 1}. ${title}`}
                    </span>
                    {row.state === "playable" && (
                      <span className={styles.chosenMeta}>
                        {row.option.releaseTitle}
                      </span>
                    )}
                  </span>
                  <TrackRowButtons
                    row={row}
                    index={index}
                    count={rows.length}
                    title={title}
                    register={register}
                    onMove={(offset) => {
                      focusRef.current = {
                        key: `${row.id}:${offset === -1 ? "up" : "down"}`,
                        fallbackKey: `${row.id}:remove`,
                      };
                      onChange(moveItem(trackIds, index, offset));
                    }}
                    onRemove={() => removeAt(index)}
                  />
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ol>
      <div role="alert">
        <Collapse isOpen={refusalKey !== null}>
          <p className={styles.lineError}>{refusalKey ? t(refusalKey) : ""}</p>
        </Collapse>
      </div>
      <Collapse isOpen={status === "error"}>
        <div ref={loadErrorRef}>
          <StudioLoadError
            loadState={tracksLoadState}
            title={t("studio:pressEdit.tracksLoadErrorTitle")}
          />
        </div>
      </Collapse>
      <label id={addLabelId} htmlFor={addId} className={styles.label}>
        {t("studio:pressEdit.addTrackLabel")}
      </label>
      <Select
        id={addId}
        labelledBy={addLabelId}
        options={addableOptions.map((option) => ({
          value: option.id,
          label: `${option.title} · ${option.releaseTitle}`,
        }))}
        value={null}
        placeholder={t("studio:pressEdit.addTrackPlaceholder")}
        loading={status === "loading"}
        disabled={
          isFull || (status !== "loading" && addableOptions.length === 0)
        }
        searchable
        onChange={(value) => {
          if (!value || isFull || trackIds.includes(value)) return;
          const nextTrackIds = [...trackIds, value];
          // The add control disables at the cap, so the new row's Remove
          // takes focus there; every other add keeps it on the trigger.
          if (nextTrackIds.length >= STUDIO_PRESS.featuredMax)
            focusRef.current = { key: `${value}:remove`, fallbackKey: null };
          onChange(nextTrackIds);
        }}
      />
    </div>
  );
}
