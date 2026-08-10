import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { FormField, ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import type { PieceListItemDto } from "../../api/pieces.api";
import styles from "./issueTabs.module.css";

export interface CoverContentsTabSaveCoverPatch {
  coverUrl: string;
  coverlines: string[];
}

export interface CoverContentsTabProps {
  number: string;
  theme: string;
  coverUrl: string;
  coverlines: string[];
  /** The pieces to write one contents blurb for — pass the running order's
   *  pieces (`runOrder.map((entry) => entry.piece)`) from the page. */
  contentsPieces: PieceListItemDto[];
  onSaveCover: (patch: CoverContentsTabSaveCoverPatch) => void;
  /** Fired (debounced) with a single piece's edited contents blurb. */
  onSaveContentsBlurb: (pieceId: string, blurb: string) => void;
}

const COVERLINE_COUNT = 3;

function normalizeCoverlines(coverlines: string[]): string[] {
  return Array.from(
    { length: COVERLINE_COUNT },
    (_, index) => coverlines[index] ?? "",
  );
}

function coverDraftsEqual(
  a: CoverContentsTabSaveCoverPatch,
  b: CoverContentsTabSaveCoverPatch,
): boolean {
  return (
    a.coverUrl === b.coverUrl &&
    a.coverlines.length === b.coverlines.length &&
    a.coverlines.every((line, index) => line === b.coverlines[index])
  );
}

/**
 * Tab 2 of the issue-production page: the cover card (`.coverwrap`, ported
 * from `mag-issue.jsx`/`mag-issue.css`) — a live preview of the cover art
 * with the coverlines overlay, next to the editable cover URL + coverline
 * fields — and a contents-blurbs card, one input per top piece.
 *
 * Autosave mirrors `ArticleEditorPage`: the inputs are bound to LOCAL draft
 * state (`draftCoverUrl`/`draftCoverlines`), seeded once per `number` (the
 * issue being edited) rather than on every prop change — otherwise the
 * `saveCover` mutation flipping react-query to `isPending` re-renders this
 * tab with the still-stale cached `coverUrl`/`coverlines`, which would snap a
 * controlled input back mid-keystroke. A ~700ms debounce on the draft then
 * fires `onSaveCover`, guarded against re-firing on the initial seed or on
 * the server echoing the same value back after a successful save. The
 * contents blurbs (one per piece) autosave the same way, keyed by piece id
 * and debounced independently of the cover fields.
 */
export function CoverContentsTab({
  number,
  theme,
  coverUrl,
  coverlines,
  contentsPieces,
  onSaveCover,
  onSaveContentsBlurb,
}: CoverContentsTabProps) {
  const { t } = useTranslation();

  // Seeds the draft from props the moment `number` (which issue this tab is
  // editing) differs from what's already seeded — React's documented pattern
  // for adjusting state when a prop changes, done synchronously during render
  // so the inputs never paint a stale/empty value. Deliberately NOT re-run on
  // every `coverUrl`/`coverlines`/`contentsPieces` change: once seeded, the
  // draft is the source of truth until the editor moves to a different issue.
  const [seededNumber, setSeededNumber] = useState<string | null>(null);
  const [draftCoverUrl, setDraftCoverUrl] = useState("");
  const [draftCoverlines, setDraftCoverlines] = useState<string[]>(
    normalizeCoverlines([]),
  );
  const [contentsDraft, setContentsDraft] = useState<Record<string, string>>({});
  if (seededNumber !== number) {
    setSeededNumber(number);
    setDraftCoverUrl(coverUrl);
    setDraftCoverlines(normalizeCoverlines(coverlines));
    const seededContentsDraft: Record<string, string> = {};
    for (const piece of contentsPieces) {
      seededContentsDraft[piece.id] = piece.contentsBlurb ?? "";
    }
    setContentsDraft(seededContentsDraft);
  }

  // Tracks the last value known to be saved (server-confirmed), so the
  // debounced autosave effect below can skip firing when the debounced draft
  // already matches it — both right after the render-phase seed above and
  // after the server echoes the same value back post-save.
  const lastSavedRef = useRef<CoverContentsTabSaveCoverPatch | null>(null);
  useEffect(() => {
    if (seededNumber !== number) return;
    lastSavedRef.current = { coverUrl, coverlines: normalizeCoverlines(coverlines) };
  }, [coverUrl, coverlines, number, seededNumber]);

  // Memoized so an unrelated re-render (e.g. a contents-blurb keystroke)
  // doesn't produce a fresh object literal that would reset the debounce timer.
  const draftSnapshot: CoverContentsTabSaveCoverPatch = useMemo(
    () => ({ coverUrl: draftCoverUrl, coverlines: draftCoverlines }),
    [draftCoverUrl, draftCoverlines],
  );
  const debouncedDraft = useDebouncedValue(draftSnapshot, 700);

  useEffect(() => {
    if (!lastSavedRef.current || coverDraftsEqual(debouncedDraft, lastSavedRef.current)) {
      return;
    }
    lastSavedRef.current = debouncedDraft;
    onSaveCover(debouncedDraft);
    // `onSaveCover` is a fresh callback most renders — only the debounced
    // draft itself should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  // Same pattern as the cover autosave above, one entry per piece id. Kept as
  // a separate ref/debounce/effect trio so a cover-field keystroke and a
  // blurb keystroke never reset each other's debounce timer.
  //
  // Only FILLS IN missing piece ids here — it never overwrites an id already
  // tracked. `saveContentsBlurb`'s mutation (`useIssueMutations.ts`) always
  // invalidates the issue-production query on success, even in demo mode,
  // where the mutation itself is a no-op toast that never writes the new
  // blurb back onto the demo fixture; the refetch that follows hands this
  // effect the SAME (pre-edit) `contentsBlurb` it started with. Overwriting
  // the just-saved entry with that stale value would make the compare in the
  // effect below see a "diff" again next time it runs and re-fire
  // `onSaveContentsBlurb` for content that was already saved. The one place
  // that's meant to update an already-tracked id is the save effect itself
  // (below), right when it fires. `lastResyncedNumberRef` clears the map once
  // per issue switch (rather than during render, which refs must not be
  // touched during) so ids from the previous issue don't linger.
  const lastSavedContentsRef = useRef<Record<string, string>>({});
  const lastResyncedNumberRef = useRef<string | null>(null);
  useEffect(() => {
    if (seededNumber !== number) return;
    if (lastResyncedNumberRef.current !== number) {
      lastResyncedNumberRef.current = number;
      lastSavedContentsRef.current = {};
    }
    for (const piece of contentsPieces) {
      if (piece.id in lastSavedContentsRef.current) continue;
      lastSavedContentsRef.current[piece.id] = piece.contentsBlurb ?? "";
    }
  }, [contentsPieces, number, seededNumber]);

  const debouncedContentsDraft = useDebouncedValue(contentsDraft, 700);
  useEffect(() => {
    for (const [pieceId, blurb] of Object.entries(debouncedContentsDraft)) {
      const lastSavedBlurb = lastSavedContentsRef.current[pieceId];
      if (lastSavedBlurb === undefined || lastSavedBlurb === blurb) continue;
      lastSavedContentsRef.current = { ...lastSavedContentsRef.current, [pieceId]: blurb };
      onSaveContentsBlurb(pieceId, blurb);
    }
    // `onSaveContentsBlurb` is a fresh callback most renders — only the
    // debounced draft itself should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContentsDraft]);

  function handleCoverUrlChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftCoverUrl(event.target.value);
  }

  function handleCoverlineChange(coverlineIndex: number) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextCoverlines = [...draftCoverlines];
      nextCoverlines[coverlineIndex] = event.target.value;
      setDraftCoverlines(nextCoverlines);
    };
  }

  function handleBlurbChange(pieceId: string) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setContentsDraft((previous) => ({
        ...previous,
        [pieceId]: event.target.value,
      }));
    };
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:issue.cover.heading")}</h3>
        <div className={styles.coverwrap}>
          <div className={styles.coverart}>
            <ImageSlot
              src={draftCoverUrl}
              alt=""
              tint="plum"
              width="100%"
              height="100%"
              radius={0}
              placeholder={t("magazine:issue.cover.artPlaceholder")}
            />
            <div className={styles.coverlines}>
              <span className={styles.ct}>{t("magazine:format.issueLabel", { number })}</span>
              <b>{theme}</b>
              {draftCoverlines.map((coverline, index) => (
                <span key={index} className={styles.cl}>
                  {coverline}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.coverFields}>
            <FormField label={t("magazine:issue.cover.imageUrlLabel")}>
              <input
                type="url"
                value={draftCoverUrl}
                onChange={handleCoverUrlChange}
                placeholder={t("magazine:issue.cover.imageUrlPlaceholder")}
              />
            </FormField>
            {draftCoverlines.map((coverline, index) => (
              <FormField
                key={index}
                label={t("magazine:issue.cover.coverlineLabel", { n: index + 1 })}
              >
                <input
                  type="text"
                  value={coverline}
                  onChange={handleCoverlineChange(index)}
                />
              </FormField>
            ))}
            <p className={styles.hint}>{t("magazine:issue.cover.hint")}</p>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:issue.contents.heading")}</h3>
        <div className={styles.contentsList}>
          {contentsPieces.map((piece) => (
            <div key={piece.id} className={styles.contentsRow}>
              <b>{piece.title}</b>
              <FormField label={t("magazine:issue.contents.blurbLabel")}>
                <input
                  type="text"
                  value={contentsDraft[piece.id] ?? ""}
                  onChange={handleBlurbChange(piece.id)}
                  placeholder={t("magazine:issue.contents.blurbPlaceholder")}
                />
              </FormField>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
