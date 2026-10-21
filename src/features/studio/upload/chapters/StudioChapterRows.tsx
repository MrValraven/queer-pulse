import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Collapse, IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  CHAPTER_ERROR_KEY,
  type ChapterRowError,
  type ChapterValidation,
} from "./studioChapterValidation";
import type { ChapterDraft } from "./studioTracklist";
import styles from "./StudioChaptersEditor.module.css";

type RowControl = "moveUp" | "moveDown" | "remove" | "time";
export type ChapterField = "time" | "title" | "artist";
export type ChapterFocusRequest = {
  rowId: string;
  control: RowControl;
} | null;

const FIELD_ERRORS: Record<ChapterField, readonly ChapterRowError[]> = {
  time: ["time", "firstAtZero", "order", "pastEnd"],
  title: ["titleRequired", "titleTooLong"],
  artist: ["artistTooLong"],
};

function FieldError({
  id,
  isOpen,
  message,
}: {
  id: string;
  isOpen: boolean;
  message: string;
}) {
  return (
    <Collapse isOpen={isOpen} className={styles.rowErrors}>
      <p id={id} className={styles.error}>
        {message}
      </p>
    </Collapse>
  );
}

type RowProps = {
  row: ChapterDraft;
  index: number;
  rowCount: number;
  errors: readonly ChapterRowError[];
  isArtistShown: boolean;
  durationLabel: string;
  isFieldErrorShown: (rowId: string, field: ChapterField) => boolean;
  register: (
    rowId: string,
    control: RowControl,
  ) => (element: HTMLElement | null) => void;
  onTouch: (rowId: string, field: ChapterField) => void;
  onEdit: (rowId: string, field: ChapterField, value: string) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onRemove: (index: number) => void;
};

/** One chapter row. A direct child of AnimatePresence, so `useIsPresent`
 *  can make it inert while it fades out. */
function StudioChapterRow({
  row,
  index,
  rowCount,
  errors,
  isArtistShown,
  durationLabel,
  isFieldErrorShown,
  register,
  onTouch,
  onEdit,
  onMove,
  onRemove,
}: RowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const number = index + 1;
  const fieldState = (field: ChapterField) => {
    const fieldErrors = errors.filter((error) =>
      FIELD_ERRORS[field].includes(error),
    );
    const isShowing =
      fieldErrors.length > 0 && isFieldErrorShown(row.id, field);
    const errorId = `${row.id}-${field}-error`;
    return {
      isShowing,
      errorId,
      invalid: isShowing ? (true as const) : undefined,
      describedBy: isShowing ? errorId : undefined,
      message: fieldErrors
        .map((error) => t(CHAPTER_ERROR_KEY[error], { time: durationLabel }))
        .join(" · "),
    };
  };
  const time = fieldState("time");
  const title = fieldState("title");
  const artist = fieldState("artist");

  return (
    <m.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
      className={
        isArtistShown ? styles.row : `${styles.row} ${styles.rowNoArtist}`
      }
      inert={!isPresent}
    >
      <input
        ref={register(row.id, "time")}
        type="text"
        className={styles.time}
        value={row.time}
        placeholder="0:00"
        aria-label={t("studio:chapters.editor.timeLabel", { number })}
        aria-invalid={time.invalid}
        aria-describedby={time.describedBy}
        onChange={(event) => onEdit(row.id, "time", event.target.value)}
        onBlur={() => onTouch(row.id, "time")}
      />
      <input
        type="text"
        className={styles.title}
        value={row.title}
        aria-label={t("studio:chapters.editor.titleLabel", { number })}
        aria-invalid={title.invalid}
        aria-describedby={title.describedBy}
        onChange={(event) => onEdit(row.id, "title", event.target.value)}
        onBlur={() => onTouch(row.id, "title")}
      />
      {isArtistShown && (
        <input
          type="text"
          className={styles.artist}
          value={row.artist}
          aria-label={t("studio:chapters.editor.artistLabel", { number })}
          aria-invalid={artist.invalid}
          aria-describedby={artist.describedBy}
          onChange={(event) => onEdit(row.id, "artist", event.target.value)}
          onBlur={() => onTouch(row.id, "artist")}
        />
      )}
      <div className={styles.rowActions}>
        <IconButton
          ref={register(row.id, "moveUp")}
          size="sm"
          tooltip
          aria-disabled={index === 0 || undefined}
          aria-label={t("studio:chapters.editor.moveUp", { number })}
          onClick={() => {
            if (index > 0) onMove(index, -1);
          }}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          ref={register(row.id, "moveDown")}
          size="sm"
          tooltip
          aria-disabled={index === rowCount - 1 || undefined}
          aria-label={t("studio:chapters.editor.moveDown", { number })}
          onClick={() => {
            if (index < rowCount - 1) onMove(index, 1);
          }}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          ref={register(row.id, "remove")}
          size="sm"
          tooltip
          aria-label={t("studio:chapters.editor.remove", { number })}
          onClick={() => onRemove(index)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>
      <FieldError
        id={time.errorId}
        isOpen={time.isShowing}
        message={time.message}
      />
      <FieldError
        id={title.errorId}
        isOpen={title.isShowing}
        message={title.message}
      />
      {isArtistShown && (
        <FieldError
          id={artist.errorId}
          isOpen={artist.isShowing}
          message={artist.message}
        />
      )}
    </m.li>
  );
}

/** The editable rows. Focus follows a moved row's button, and a removed
 *  row hands it to its neighbour (or to the Add button the parent owns). */
export function StudioChapterRows({
  rows,
  isArtistShown = true,
  validation,
  durationLabel,
  isFieldErrorShown,
  focusRequest,
  onFocusHandled,
  onTouch,
  onEdit,
  onMove,
  onRemove,
}: {
  rows: readonly ChapterDraft[];
  isArtistShown?: boolean;
  validation: ChapterValidation;
  durationLabel: string;
  isFieldErrorShown: (rowId: string, field: ChapterField) => boolean;
  focusRequest: ChapterFocusRequest;
  onFocusHandled: () => void;
  onTouch: (rowId: string, field: ChapterField) => void;
  onEdit: (rowId: string, field: ChapterField, value: string) => void;
  onMove: (index: number, offset: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const controlsRef = useRef(new Map<string, HTMLElement>());
  useLayoutEffect(() => {
    if (!focusRequest) return;
    controlsRef.current
      .get(`${focusRequest.rowId}:${focusRequest.control}`)
      ?.focus();
    onFocusHandled();
  });
  const register =
    (rowId: string, control: RowControl) => (element: HTMLElement | null) => {
      if (element) controlsRef.current.set(`${rowId}:${control}`, element);
      else controlsRef.current.delete(`${rowId}:${control}`);
    };

  return (
    <ol className={styles.rows}>
      <AnimatePresence initial={false}>
        {rows.map((row, index) => (
          <StudioChapterRow
            key={row.id}
            row={row}
            index={index}
            rowCount={rows.length}
            errors={validation.rowErrors[index] ?? []}
            isArtistShown={isArtistShown}
            durationLabel={durationLabel}
            isFieldErrorShown={isFieldErrorShown}
            register={register}
            onTouch={onTouch}
            onEdit={onEdit}
            onMove={onMove}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </ol>
  );
}
