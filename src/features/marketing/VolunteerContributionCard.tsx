import { StatGrid, StatTile } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
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
 * their desk sees why the total has not moved, instead of an empty state that
 * reads as "you have done nothing".
 *
 * Renders nothing at all until there is something true to say, so the page
 * does not grow an empty panel for a member who has never volunteered.
 */
export function VolunteerContributionCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useMyContribution();

  if (isLoading) {
    return (
      <section className={s.contribution} aria-busy>
        <div className="wrap">
          <p className={s.contributionNote}>
            {t("marketing:volunteer.contribution.loading")}
          </p>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const hasAnything =
    data.sessionCount > 0 ||
    data.hoursContributed > 0 ||
    data.awaitingConfirmationCount > 0;
  if (!hasAnything) return null;

  const heading = t("marketing:volunteer.contribution.title");
  const hasConfirmed = data.sessionCount > 0;

  return (
    <section className={s.contribution} aria-label={heading}>
      <div className="wrap">
        <h2 className={s.contributionTitle}>{heading}</h2>

        {hasConfirmed ? (
          <>
            <StatGrid columns={2}>
              <StatTile
                label={t("marketing:volunteer.contribution.sessions")}
                value={data.sessionCount}
                hint={
                  data.lastCompletedAt
                    ? t("marketing:volunteer.contribution.lastOne", {
                        when: formatDate(new Date(data.lastCompletedAt)),
                      })
                    : undefined
                }
              />
              <StatTile
                label={t("marketing:volunteer.contribution.hours")}
                value={data.hoursContributed}
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

        {data.awaitingConfirmationCount > 0 && (
          <p className={s.contributionNote}>
            {t("marketing:volunteer.contribution.awaiting", {
              count: data.awaitingConfirmationCount,
            })}
          </p>
        )}
      </div>
    </section>
  );
}
