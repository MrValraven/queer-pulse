import { useId, useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryTeamPortraitList } from "./DirectoryTeamPortrait";
import { isTeamKindShared, splitTeamAtFold } from "./directoryTeam.data";
import s from "./DirectorySpacePage.module.css";
import styles from "./DirectoryTeamPortrait.module.css";

/**
 * "Meet the team": the personas and members who work at this listing, as links
 * to their pages. The first few show; the rest fold behind a Show all toggle.
 */
export function DirectoryTeamSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const foldedRegionId = useId();
  const members = place.team ?? [];
  if (members.length === 0) return null;

  const { visible, folded } = splitTeamAtFold(members);
  // Over the whole team, folded entries included: four tattoo artists
  // each labelled "Tattoo artist" tells a visitor nothing. A lone card
  // repeats nothing, so it keeps its craft. With a member on the team every
  // card keeps its own chip.
  const isKindShared = isTeamKindShared(members);

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.team.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>{t("marketing:directory.detail.team.sub")}</p>
      <DirectoryTeamPortraitList
        members={visible}
        isKindShared={isKindShared}
      />
      {folded.length > 0 && (
        <>
          <div id={foldedRegionId}>
            <Collapse isOpen={isShowingAll}>
              <div className={styles.foldedList}>
                <DirectoryTeamPortraitList
                  members={folded}
                  isKindShared={isKindShared}
                  positionOffset={visible.length}
                />
              </div>
            </Collapse>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={styles.toggle}
            aria-expanded={isShowingAll}
            aria-controls={foldedRegionId}
            onClick={() => setIsShowingAll((current) => !current)}
          >
            {isShowingAll
              ? t("marketing:directory.detail.team.showFewer")
              : t("marketing:directory.detail.team.showAll", {
                  count: members.length,
                })}
          </Button>
        </>
      )}
    </section>
  );
}
