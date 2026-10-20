import { useId, useState } from "react";
import { Button, Collapse } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryTeamCard } from "./DirectoryTeamCard";
import { splitTeamAtFold } from "./directoryTeam.data";
import type { ListingTeamMemberView } from "./listBusiness/api/listingTeam.types";
import s from "./DirectorySpacePage.module.css";
import styles from "./DirectoryTeam.module.css";

function TeamList({ members }: { members: ListingTeamMemberView[] }) {
  return (
    <ul className={styles.grid}>
      {members.map((member) => (
        <li key={member.persona.id} className={styles.item}>
          <DirectoryTeamCard member={member} />
        </li>
      ))}
    </ul>
  );
}

/**
 * "Meet the team": the personas who work at this listing, as links to their
 * pages. The first few show; the rest fold behind a Show all toggle.
 */
export function DirectoryTeamSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const foldedRegionId = useId();
  const members = place.team ?? [];
  if (members.length === 0) return null;

  const { visible, folded } = splitTeamAtFold(members);

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.team.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>{t("marketing:directory.detail.team.sub")}</p>
      <TeamList members={visible} />
      {folded.length > 0 && (
        <>
          <div id={foldedRegionId}>
            <Collapse isOpen={isShowingAll}>
              <div className={styles.foldedList}>
                <TeamList members={folded} />
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
