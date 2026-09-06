import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { FormField, ImageSlot } from "../../../../shared/components/ui";
import type { CropRect } from "../../../../shared/components/ui/cropGeometry";
import { ImageUploadField } from "../../../subprofiles/ImageUploadField";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import type { PieceListItemDto } from "../../api/pieces.api";
import {
  useIssueSubmissionDeadline,
  useSaveSubmissionDeadline,
} from "../../api/useSubmissionWindow";
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
 * PRD-106 — when submissions close for this issue.
 *
 * The public submit-story form used to print "Submission deadline 15 August
 * 2026" from a frontend constant, because nothing in the database held a
 * deadline at all. This field is where a real one comes from: the form prints
 * that line only while a date is stored here, and clearing the field takes the
 * line back off.
 *
 * Self-contained on purpose. Every other field on this tab is a controlled
 * prop from `IssueProductionPage`, but the deadline is one nullable column
 * with its own read/write pair (`GET`/`PATCH
 * /magazine/admin/issues/:number/submission-deadline`), so threading it
 * through the page would buy nothing. It only needs the issue number, which
 * this tab already has.
 *
 * Autosave follows the cover fields below: a local draft, a ~700ms debounce,
 * and a `lastSavedRef` re-synced from the server so neither the initial seed
 * nor the server echoing the same value back re-fires the save.
 */
function SubmissionDeadlineCard({ issueNumber }: { issueNumber: string }) {
  const { t } = useTranslation();
  const { submissionDeadline, isLoading } =
    useIssueSubmissionDeadline(issueNumber);
  const saveSubmissionDeadline = useSaveSubmissionDeadline(issueNumber);

  // Seeded once the first read lands, and again whenever the tab moves to a
  // different issue. Done during render, React's documented pattern for
  // adjusting state to a changed prop, so the input never paints a stale value.
  const [seededKey, setSeededKey] = useState<string | null>(null);
  const [draftDeadline, setDraftDeadline] = useState("");
  const seedKey = isLoading ? null : issueNumber;
  if (seedKey !== null && seededKey !== seedKey) {
    setSeededKey(seedKey);
    setDraftDeadline(submissionDeadline ?? "");
  }

  const lastSavedRef = useRef<string | null>(null);
  useEffect(() => {
    if (seededKey !== issueNumber) return;
    lastSavedRef.current = submissionDeadline ?? "";
  }, [submissionDeadline, issueNumber, seededKey]);

  const debouncedDeadline = useDebouncedValue(draftDeadline, 700);
  useEffect(() => {
    if (
      lastSavedRef.current === null ||
      lastSavedRef.current === debouncedDeadline
    ) {
      return;
    }
    lastSavedRef.current = debouncedDeadline;
    saveSubmissionDeadline.mutate(
      debouncedDeadline === "" ? null : debouncedDeadline,
    );
    // Only the debounced draft should re-trigger the autosave; the mutation
    // object is a fresh reference most renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDeadline]);

  return (
    <div className={styles.card}>
      <h3>{t("magazine:issue.submissionDeadline.heading")}</h3>
      <FormField label={t("magazine:issue.submissionDeadline.label")}>
        <input
          type="date"
          value={draftDeadline}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraftDeadline(event.target.value)
          }
        />
      </FormField>
      <p className={styles.hint}>
        {t("magazine:issue.submissionDeadline.hint")}
      </p>
    </div>
  );
}

/**
 * Tab 2 of the issue-production page: the cover card (`.coverwrap`, ported
 * from `mag-issue.jsx`/`mag-issue.css`) — a live preview of the cover art
 * with the coverlines overlay, next to the cover-art upload field + coverline
 * fields — and a contents-blurbs card, one input per top piece.
 *
 * PRD-128 — the cover used to be a bare `type="url"` text box, which meant the
 * one image every issue needs was the only art in the magazine an editor could
 * not upload from the desk: they had to host it somewhere else and paste a
 * link. It now goes through the same `ImageUploadField` as a piece's lead art,
 * on the `story-cover` upload kind that `MagazineIssue.coverUrl` is already
 * registered under (`media-reference-sources.ts`), so the presign limits, the
 * client-side metadata strip, the 2:1 reframe editor and the media-library
 * label all match what the column expects.
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
  const [contentsDraft, setContentsDraft] = useState<Record<string, string>>(
    {},
  );
  // The locally-renderable preview of a cover picked THIS session, reported by
  // `ImageUploadField.onPreviewChange`. `onChange` only hands back the storage
  // key, which is private and not fetchable, so the big cover plate beside the
  // field has nothing to show for a fresh pick until the save round-trips and
  // the backend resolves the key to a display URL. `crop` rides along so the
  // plate frames the pick the way the editor just framed it.
  const [coverPick, setCoverPick] = useState<{
    url: string;
    crop?: CropRect;
  } | null>(null);
  if (seededNumber !== number) {
    setSeededNumber(number);
    setDraftCoverUrl(coverUrl);
    setDraftCoverlines(normalizeCoverlines(coverlines));
    // A pick belongs to the issue it was made on. Moving to a different issue
    // drops it, so the plate never shows the previous issue's cover.
    setCoverPick(null);
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
    lastSavedRef.current = {
      coverUrl,
      coverlines: normalizeCoverlines(coverlines),
    };
  }, [coverUrl, coverlines, number, seededNumber]);

  // Memoized so an unrelated re-render (e.g. a contents-blurb keystroke)
  // doesn't produce a fresh object literal that would reset the debounce timer.
  const draftSnapshot: CoverContentsTabSaveCoverPatch = useMemo(
    () => ({ coverUrl: draftCoverUrl, coverlines: draftCoverlines }),
    [draftCoverUrl, draftCoverlines],
  );
  const debouncedDraft = useDebouncedValue(draftSnapshot, 700);

  useEffect(() => {
    if (
      !lastSavedRef.current ||
      coverDraftsEqual(debouncedDraft, lastSavedRef.current)
    ) {
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
      lastSavedContentsRef.current = {
        ...lastSavedContentsRef.current,
        [pieceId]: blurb,
      };
      onSaveContentsBlurb(pieceId, blurb);
    }
    // `onSaveContentsBlurb` is a fresh callback most renders — only the
    // debounced draft itself should re-trigger this autosave effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContentsDraft]);

  /**
   * The value the upload field commits: a bare storage key for a fresh pick,
   * the resolved display URL the tab was seeded with when nothing was picked,
   * or `""` on remove. All three go straight into the draft and autosave like
   * any other cover edit: `UpdateCoverDto` treats `""` as "clear the cover",
   * and the backend's `StorageKeyOwnershipInterceptor` collapses a resolved
   * `/files/<key>` URL back to the bare key before it is persisted. That last
   * part is what keeps a re-save working on an issue whose cover a DIFFERENT
   * editor uploaded: `updateCover`'s `assertNoForeignUploadIntroduced` compares
   * the collapsed key against the stored one and allows it while unchanged, so
   * echoing the seeded value back is never a new foreign reference.
   */
  function handleCoverKeyChange(coverKey: string) {
    setDraftCoverUrl(coverKey);
  }

  function handleCoverPreviewChange(
    previewUrl: string | null,
    crop?: CropRect,
  ) {
    setCoverPick(previewUrl ? { url: previewUrl, crop } : null);
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
              // A fresh pick renders from its local preview URL; otherwise the
              // committed value, which the backend serves as a resolved
              // display URL.
              src={coverPick?.url ?? draftCoverUrl}
              alt=""
              tint="plum"
              width="100%"
              height="100%"
              radius={0}
              // A pick's reframe rect is applied as a FOCAL POINT, never as an
              // exact `crop`: this plate is a fixed 340px-tall box whose aspect
              // never matches the 2:1 cover crop, and an exact frame would
              // stretch the art. Focal mode keeps `object-fit: cover` and only
              // moves which band of the image survives.
              focus={coverPick?.crop}
              placeholder={t("magazine:issue.cover.artPlaceholder")}
            />
            <div className={styles.coverlines}>
              <span className={styles.ct}>
                {t("magazine:format.issueLabel", { number })}
              </span>
              <b>{theme}</b>
              {draftCoverlines.map((coverline, index) => (
                <span key={index} className={styles.cl}>
                  {coverline}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.coverFields}>
            <FormField
              label={t("magazine:issue.cover.imageLabel")}
              helper={t("magazine:issue.cover.imageHelper")}
            >
              <ImageUploadField
                // `story-cover` is this column's own upload kind: prefix
                // `story-covers`, 10 MB, at least 1200x600, and the 2:1 reframe
                // aspect a cover plate is drawn at. It is also the kind
                // `MagazineIssue.coverUrl` is registered under in
                // `media-reference-sources.ts`, so an uploaded cover is tracked
                // and garbage-collected like every other image reference.
                kind="story-cover"
                value={draftCoverUrl}
                onChange={handleCoverKeyChange}
                onPreviewChange={handleCoverPreviewChange}
                size={140}
                placeholder={t("magazine:issue.cover.imagePlaceholder")}
              />
            </FormField>
            {draftCoverlines.map((coverline, index) => (
              <FormField
                key={index}
                label={t("magazine:issue.cover.coverlineLabel", {
                  n: index + 1,
                })}
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

      <SubmissionDeadlineCard issueNumber={number} />
    </div>
  );
}
