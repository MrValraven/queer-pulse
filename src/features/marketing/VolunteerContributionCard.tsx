import { Collapse, StatGrid, StatTile } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import type { MyVolunteerContributionDTO } from "./api/volunteering.api";
import { useMyContribution } from "./api/useMyContribution";
import s from "./VolunteerPage.module.css";

/**
 * The volunteer's own side of SUS-05: sessions and hours a poster confirmed
 * they turned up for. Mounted on `/about/volunteer` for a signed-in member
 * only, since `GET /volunteering/me/contribution` sits behind
 * `ActiveMemberGuard`.
 *
 * Every number here was written by someone else (the poster or a community
 * organiser confirming the session), which is what the note says and what
 * makes it worth showing at all. `awaitingConfirmationCount` is the honest
 * counterweight: a member who has volunteered but whose poster is behind on
 * their desk sees why the total has not moved. An empty state there would
 * read as "you have done nothing".
 *
 * Shows nothing at all until there is something true to say, so the page
 * does not grow an empty panel for a member who has never volunteered. The
 * loading line and the summary each fold in and out with `Collapse` at the
 * foot of the results column, so the guide band below eases down or back up
 * as the read settles while the count row and the roles above stay put.
 */
export function VolunteerContributionCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useMyContribution();

  const hasAnything =
    data !== undefined &&
    (data.sessionCount > 0 ||
      data.hoursContributed > 0 ||
      data.awaitingConfirmationCount > 0);

  return (
    <>
      <Collapse isOpen={isLoading}>
        <section className={s.contribution} aria-busy>
          <p className={s.contributionNote}>
            {t("marketing:volunteer.contribution.loading")}
          </p>
        </section>
      </Collapse>
      <Collapse isOpen={hasAnything}>
        {data && <ContributionSummary contribution={data} />}
      </Collapse>
    </>
  );
}

/** The confirmed sessions and hours, plus any sessions still waiting on a
 *  poster, once the member has at least one of them. */
function ContributionSummary({
  contribution,
}: {
  contribution: MyVolunteerContributionDTO;
}) {
  const { t } = useTranslation();
  const heading = t("marketing:volunteer.contribution.title");
  const hasConfirmed = contribution.sessionCount > 0;

  return (
    <section className={s.contribution} aria-label={heading}>
      <h2 className={s.contributionTitle}>{heading}</h2>

      {hasConfirmed ? (
        <>
          <StatGrid columns={2}>
            <StatTile
              label={t("marketing:volunteer.contribution.sessions")}
              value={contribution.sessionCount}
              hint={
                contribution.lastCompletedAt
                  ? t("marketing:volunteer.contribution.lastOne", {
                      when: formatDate(new Date(contribution.lastCompletedAt)),
                    })
                  : undefined
              }
            />
            <StatTile
              label={t("marketing:volunteer.contribution.hours")}
              value={contribution.hoursContributed}
            />
          </StatGrid>
          <p className={s.contributionNote}>
            {t("marketing:volunteer.contribution.note")}
          </p>
        </>
      ) : (
        <p className={s.contributionNote}>
          {t("marketing:volunteer.contribution.empty")}
        </p>
      )}

      {contribution.awaitingConfirmationCount > 0 && (
        <p className={s.contributionNote}>
          {t("marketing:volunteer.contribution.awaiting", {
            count: contribution.awaitingConfirmationCount,
          })}
        </p>
      )}
    </section>
  );
}
