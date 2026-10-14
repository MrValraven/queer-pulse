import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { formatChapterTime } from "./studioChapterTime";
import { validateChapters } from "./studioChapterValidation";
import {
  StudioChapterRows,
  type ChapterField,
  type ChapterFocusRequest,
} from "./StudioChapterRows";
import { createChapterDraftId, type ChapterDraft } from "./studioTracklist";
import { StudioTracklistPaste } from "./StudioTracklistPaste";
import styles from "./StudioChaptersEditor.module.css";

/** Chapters in the track details panel (spec 8.5). Controlled. */
export function StudioChaptersEditor({
  rows,
  onChange,
  durationSeconds,
  hasAudio,
  isInitiallyOpen,
  isShowingAllErrors,
  isEpisode = false,
}: {
  rows: readonly ChapterDraft[];
  onChange: (rows: ChapterDraft[]) => void;
  durationSeconds: number | null;
  hasAudio: boolean;
  isInitiallyOpen: boolean;
  isShowingAllErrors: boolean;
  /** An episode reads its own hint and paste label and has no artist field. */
  isEpisode?: boolean;
}) {
  const { t } = useTranslation();
  const listErrorId = useId();
  const panelId = useId();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);
  // Opens only: the "Fix the chapters marked below" summary must point at
  // visible rows. Derived during render, so the Collapse opens in one pass.
  const [wasShowingAllErrors, setWasShowingAllErrors] =
    useState(isShowingAllErrors);
  if (isShowingAllErrors !== wasShowingAllErrors) {
    setWasShowingAllErrors(isShowingAllErrors);
    if (isShowingAllErrors) setIsOpen(true);
  }
  const [touchedFields, setTouchedFields] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [focusRequest, setFocusRequest] = useState<ChapterFocusRequest>(null);
  const validation = useMemo(
    () => validateChapters(rows, durationSeconds),
    [rows, durationSeconds],
  );
  const durationLabel =
    durationSeconds === null ? "" : formatChapterTime(durationSeconds);

  // Set when the last row is removed; the Add button takes focus once the
  // list has re-rendered empty.
  const shouldFocusAddRef = useRef(false);
  useLayoutEffect(() => {
    if (!shouldFocusAddRef.current) return;
    shouldFocusAddRef.current = false;
    addButtonRef.current?.focus();
  }, [rows.length]);

  const edit = (rowId: string, field: ChapterField, value: string) =>
    onChange(
      rows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  const move = (index: number, offset: -1 | 1) => {
    const next = [...rows];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(index + offset, 0, moved);
    setFocusRequest({
      rowId: moved.id,
      control: offset === -1 ? "moveUp" : "moveDown",
    });
    onChange(next);
  };
  const remove = (index: number) => {
    const neighbour = rows[index + 1] ?? rows[index - 1];
    shouldFocusAddRef.current = !neighbour;
    setFocusRequest(
      neighbour ? { rowId: neighbour.id, control: "remove" } : null,
    );
    onChange(rows.filter((_row, rowIndex) => rowIndex !== index));
  };
  const add = () => {
    const added = {
      id: createChapterDraftId(),
      time: "",
      title: "",
      artist: "",
    };
    setFocusRequest({ rowId: added.id, control: "time" });
    onChange([...rows, added]);
  };

  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <span>{t("studio:chapters.editor.heading")}</span>
        {rows.length > 0 && (
          <span className={styles.count}>
            {t("studio:chapters.editor.count", { count: rows.length })}
          </span>
        )}
        <FiChevronDown
          aria-hidden
          className={styles.chevron}
          data-open={isOpen || undefined}
        />
      </button>
      <Collapse isOpen={isOpen}>
        <div id={panelId} className={styles.panel}>
          {!hasAudio ? (
            <p className={styles.hint}>
              {t("studio:chapters.editor.needsAudio")}
            </p>
          ) : (
            <>
              <p className={styles.hint}>
                {t(
                  isEpisode
                    ? "studio:chapters.editor.hintEpisode"
                    : "studio:chapters.editor.hint",
                )}
              </p>
              <StudioChapterRows
                rows={rows}
                isArtistShown={!isEpisode}
                validation={validation}
                durationLabel={durationLabel}
                isFieldErrorShown={(rowId, field) =>
                  isShowingAllErrors || touchedFields.has(`${rowId}:${field}`)
                }
                focusRequest={focusRequest}
                onFocusHandled={() => setFocusRequest(null)}
                onTouch={(rowId, field) =>
                  setTouchedFields((previous) =>
                    new Set(previous).add(`${rowId}:${field}`),
                  )
                }
                onEdit={edit}
                onMove={move}
                onRemove={remove}
              />
              <Collapse isOpen={validation.listError !== null}>
                <p id={listErrorId} className={styles.error} role="alert">
                  {t("studio:chapters.error.tooMany")}
                </p>
              </Collapse>
              <button
                ref={addButtonRef}
                type="button"
                className={styles.linkButton}
                aria-describedby={
                  validation.listError !== null ? listErrorId : undefined
                }
                onClick={add}
              >
                <FiPlus aria-hidden /> {t("studio:chapters.editor.add")}
              </button>
              <StudioTracklistPaste
                toggleKey={
                  isEpisode ? "studio:chapters.editor.pasteEpisode" : undefined
                }
                onApply={(pasted) => {
                  setTouchedFields(
                    new Set(
                      pasted.flatMap((row) =>
                        (["time", "title", "artist"] as const).map(
                          (field) => `${row.id}:${field}`,
                        ),
                      ),
                    ),
                  );
                  onChange(pasted);
                }}
              />
            </>
          )}
        </div>
      </Collapse>
    </section>
  );
}
