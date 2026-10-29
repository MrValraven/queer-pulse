import { useState, type Ref } from "react";
import { FiEdit3, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { Button, Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  tintForId,
} from "../studio/api/studio.adapters";
import { StudioReleaseCoverArt } from "../studio/StudioReleaseCoverArt";
import { releaseFactsLine } from "../studio/studioFacts";
import type { AdminStudioPickDTO } from "./api/studioDiscoveryAdmin.api";
import { ageOf } from "./studioAdmin.model";
import { AdminChip } from "./ui";
import { useStudioAdminCoverReveal } from "./useStudioAdminCoverReveal";
import css from "./StudioAdminShelves.module.css";

/** The featured release inside its hero card: the big cover, the title in
 *  the serif, the artist, the facts line, the note as a pull-quote, the age
 *  and the not-listenable chip, then Replace (the tab's one primary), Edit
 *  note (Add a note while there is none) and Remove pick. */
export function StudioAdminFeaturedPick({
  pick,
  shelfLabel,
  isBusy,
  replaceButtonRef,
  onReplace,
  onEditNote,
  onRemove,
}: {
  pick: AdminStudioPickDTO;
  shelfLabel: string;
  isBusy: boolean;
  /** Set or replace hands focus here once the new pick's card mounts. */
  replaceButtonRef: Ref<HTMLButtonElement>;
  onReplace: () => void;
  onEditNote: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Read once on mount: the age is a coarse label, so a render keeps it.
  const [nowMs] = useState(() => Date.now());
  const { release } = pick;
  const age = ageOf(pick.createdAt, nowMs);
  const facts = releaseFactsLine(
    {
      typeLabelKey: STUDIO_RELEASE_TYPE_LABEL_KEY[release.type],
      trackCount: release.trackCount,
      totalDurationSeconds: release.totalDurationSeconds,
    },
    t,
  );
  const { isCoverLoaded, onCoverLoad } = useStudioAdminCoverReveal(
    release.coverUrl,
  );

  return (
    <>
      <span
        className={css.featuredCover}
        aria-hidden
        data-cover-loaded={isCoverLoaded || undefined}
        onLoad={onCoverLoad}
      >
        <StudioReleaseCoverArt
          src={release.coverUrl}
          title={release.title}
          format={release.format ?? "music"}
          tint={tintForId(release.id)}
          radius={16}
        />
      </span>
      <div className={css.featuredInfo}>
        <h3 className={css.featuredTitle}>{release.title}</h3>
        <p className={css.featuredArtist}>{release.artist.name}</p>
        <p className={css.featuredFacts}>{facts}</p>
        <Collapse isOpen={Boolean(pick.note)}>
          <p className={css.featuredNote}>{pick.note}</p>
        </Collapse>
        <div className={css.featuredMeta}>
          <span className={css.featuredAge}>
            {t("admin:studioAdmin.pick.added", {
              age: fmt.relativeTime(-age.value, age.unit),
            })}
          </span>
          <Collapse isOpen={!pick.isListenable}>
            <AdminChip tone="amber">
              {t("admin:studioAdmin.pick.notListenable")}
            </AdminChip>
          </Collapse>
        </div>
        <div className={css.featuredActions}>
          <Button variant="primary" ref={replaceButtonRef} onClick={onReplace}>
            <FiRefreshCw aria-hidden />
            {t("admin:studioAdmin.featured.replaceCta")}
          </Button>
          {pick.note ? (
            <Button
              variant="ghost"
              aria-label={t("admin:studioAdmin.pick.editNoteAria", {
                title: release.title,
              })}
              onClick={onEditNote}
            >
              <FiEdit3 aria-hidden />
              {t("admin:studioAdmin.pick.editNoteCta")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              aria-label={t("admin:studioAdmin.pick.addNoteAria", {
                title: release.title,
              })}
              onClick={onEditNote}
            >
              <FiPlus aria-hidden />
              {t("admin:studioAdmin.pick.addNoteCta")}
            </Button>
          )}
          <Button
            variant="ghost"
            aria-label={t("admin:studioAdmin.pick.removeAria", {
              title: release.title,
              shelf: shelfLabel,
            })}
            aria-disabled={isBusy || undefined}
            onClick={onRemove}
          >
            <FiX aria-hidden />
            {t("admin:studioAdmin.pick.removeCta")}
          </Button>
        </div>
      </div>
    </>
  );
}
