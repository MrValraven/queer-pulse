import { useId, useState } from "react";
import { FiChevronDown, FiEyeOff } from "react-icons/fi";
import { Collapse } from "../../../../../shared/components/ui";
import type { VjClipDTO } from "../../../../../shared/contracts/vj";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VJ_SOCKET_REASON_KEY } from "../../../vjErrors";
import styles from "./VjShuffleSheetV2.module.css";

/** Never a real list signature (ids are uuids), so the next render re-reads the stage's list. */
const RESYNC_SIGNATURE = "resync";

/** Order-free: the server sorts and lowercases the list it echoes back. */
function signatureOf(clipIds: readonly string[]): string {
  return [...clipIds]
    .map((clipId) => clipId.toLowerCase())
    .sort()
    .join(",");
}

export interface VjShuffleExclusionsProps {
  packClips: readonly VjClipDTO[];
  /** The stage's `shuffle.excludedClipIds`. */
  excludedClipIds: readonly string[];
  /** Leaving clips out needs an active pack (`vj_no_active_pack`). */
  activePackId: string | null;
  isBlocked: boolean;
  /** Sends the whole list; the answer lets the list fall back on a refusal. */
  onSend: (excludedClipIds: string[]) => Promise<VjCommandOutcome>;
}

/**
 * Leave out: the active pack's clips as check buttons, folded under a header
 * that counts how many sit out. A tap sends the whole `excludedClipIds` list.
 * Only ids of the pack's current clips travel, so the list stays within
 * `VJ_LIMITS.excludedClipIdsMax` (a pack holds at most as many clips) and ids
 * of clips that left the pack drop out on the next send.
 */
export function VjShuffleExclusions({
  packClips,
  excludedClipIds,
  activePackId,
  isBlocked,
  onSend,
}: VjShuffleExclusionsProps) {
  const { t } = useTranslation();
  const headerId = useId();
  const panelId = useId();
  const hintId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<readonly string[]>(excludedClipIds);
  const stageSignature = signatureOf(excludedClipIds);
  const [syncedSignature, setSyncedSignature] = useState(stageSignature);

  // Another remote, the echo or a refusal moved the list: show the stage's.
  if (syncedSignature !== stageSignature) {
    setSyncedSignature(stageSignature);
    setDraft(excludedClipIds);
  }

  const hasActivePack = activePackId !== null;
  const isHeld = isBlocked || !hasActivePack;
  const excludedSet = new Set(draft.map((clipId) => clipId.toLowerCase()));
  const packClipIds = new Set(packClips.map((clip) => clip.id.toLowerCase()));
  const excludedCount = [...excludedSet].filter((clipId) =>
    packClipIds.has(clipId),
  ).length;

  const toggleClip = (clipId: string) => {
    if (isHeld) return;
    const normalizedId = clipId.toLowerCase();
    const nextIds = packClips
      .map((clip) => clip.id.toLowerCase())
      .filter((packClipId) =>
        packClipId === normalizedId
          ? !excludedSet.has(packClipId)
          : excludedSet.has(packClipId),
      );
    setDraft(nextIds);
    void onSend(nextIds).then((outcome) => {
      if (!outcome.ok) setSyncedSignature(RESYNC_SIGNATURE);
    });
  };

  const hintKey = hasActivePack
    ? packClips.length === 0
      ? "vj:remote.packEmpty"
      : null
    : VJ_SOCKET_REASON_KEY.vj_no_active_pack;

  return (
    <section className={styles.exclusions} data-vj-shuffle-exclusions="">
      <button
        type="button"
        id={headerId}
        className={styles.foldHeader}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.foldTitle}>{t("vj:shuffle.exclude")}</span>
        <span className={styles.foldMeta}>
          {t("vj:shuffle.excludedCount", { count: excludedCount })}
        </span>
        <FiChevronDown aria-hidden fill="none" className={styles.foldChevron} />
      </button>
      <Collapse isOpen={isOpen}>
        <div id={panelId} className={styles.foldPanel}>
          <Collapse isOpen={hintKey !== null}>
            <p id={hintId} className={styles.hint}>
              {hintKey === null ? "" : t(hintKey)}
            </p>
          </Collapse>
          <ul
            className={styles.clipList}
            aria-labelledby={headerId}
            data-vj-shuffle-clip-list=""
          >
            {packClips.map((clip) => {
              const isExcluded = excludedSet.has(clip.id.toLowerCase());
              return (
                <li key={clip.id}>
                  <button
                    type="button"
                    className={styles.clipRow}
                    aria-pressed={isExcluded}
                    aria-disabled={isHeld}
                    aria-describedby={hasActivePack ? undefined : hintId}
                    aria-label={t("vj:shuffle.excludeAria", {
                      title: clip.title,
                    })}
                    onClick={() => toggleClip(clip.id)}
                  >
                    <img
                      className={styles.clipThumb}
                      src={clip.thumbnailUrl}
                      alt=""
                      width={64}
                      height={36}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.clipTitle}>{clip.title}</span>
                    <FiEyeOff
                      aria-hidden
                      fill="none"
                      className={styles.clipMark}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Collapse>
    </section>
  );
}
