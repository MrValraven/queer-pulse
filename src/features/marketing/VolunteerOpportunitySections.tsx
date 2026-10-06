import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiUsers } from "react-icons/fi";
import type {
  TeamMember,
  VolunteerOpportunity,
} from "./volunteerOpportunities";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MembersExplainerModal } from "../homepage/sections/MembersExplainerModal";
import styles from "./VolunteerOpportunityPage.module.css";

/**
 * PRD-454. "Who's already in": a signed-in member goes straight to each
 * teammate's profile (the directory, for a demo teammate with no slug). A
 * signed-out visitor would only meet the sign-in wall there, so each pill
 * opens the members explainer. A live read names nobody to a signed-out
 * visitor (ENG-474), so for them an empty team becomes one pill that opens the
 * same explainer. The caller renders this only when the opportunity has a team
 * (`hasTeam`), so that pill always points at a real team.
 */
function TeamPills({
  team,
  isSignedIn,
}: {
  team: TeamMember[];
  isSignedIn: boolean;
}) {
  const { t } = useTranslation();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  return (
    <div className={styles.teamRow}>
      {!isSignedIn && team.length === 0 && (
        <button
          type="button"
          className={styles.teamPill}
          onClick={() => setIsExplainerOpen(true)}
        >
          <span aria-hidden className={styles.av}>
            <FiUsers />
          </span>
          {t("marketing:volunteerDetail.main.teamSignedOutCta")}
        </button>
      )}
      {team.map((member, index) => {
        const pillContent = (
          <>
            <span
              aria-hidden
              className={styles.av}
              style={{ background: member.background, color: member.color }}
            >
              {member.initials}
            </span>
            {member.name}
          </>
        );
        const key = member.slug ?? `${member.name}-${index}`;
        return isSignedIn ? (
          <Link
            to={
              member.slug ? `${routes.members}/${member.slug}` : routes.members
            }
            className={styles.teamPill}
            key={key}
          >
            {pillContent}
          </Link>
        ) : (
          <button
            type="button"
            className={styles.teamPill}
            key={key}
            onClick={() => setIsExplainerOpen(true)}
          >
            {pillContent}
          </button>
        );
      })}
      {isExplainerOpen && (
        <MembersExplainerModal onClose={() => setIsExplainerOpen(false)} />
      )}
    </div>
  );
}

export function VolunteerOpportunityMain({
  opp,
  isSignedIn,
  hasTeam,
}: {
  opp: VolunteerOpportunity;
  isSignedIn: boolean;
  /** The opportunity has a team on record. A signed-out reader is named
   *  nobody, so this alone decides whether they get the "see who's in" pill,
   *  with or without a team intro. */
  hasTeam: boolean;
}) {
  const shouldShowTeamPills = opp.team.length > 0 || (!isSignedIn && hasTeam);
  return (
    <div>
      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:volunteerDetail.main.whyTitle"
            components={{ em: <em /> }}
          />
        </h2>
        {opp.why.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className={styles.sec}>
        <h2>
          <Translation
            i18nKey="marketing:volunteerDetail.main.tasksTitle"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.tasks}>
          {opp.tasks.map((task) => (
            <div className={styles.taskRow} key={task.title}>
              <div className={styles.taskIc}>
                <FiCheck aria-hidden />
              </div>
              <div>
                <b>{task.title}</b>
                <span>{task.description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {opp.commitments.length > 0 && (
        <section className={styles.sec}>
          <h2>
            <Translation
              i18nKey="marketing:volunteerDetail.main.commitmentTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={styles.commitGrid}>
            {opp.commitments.map((c) => (
              <div className={styles.commit} key={c.b}>
                <b>{c.b}</b>
                <span>{c.s}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {opp.goodFor.length > 0 && (
        <section className={styles.sec}>
          <h2>
            <Translation
              i18nKey="marketing:volunteerDetail.main.goodForTitle"
              components={{ em: <em /> }}
            />
          </h2>
          {opp.goodFor.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {(opp.teamIntro || shouldShowTeamPills) && (
        <section className={styles.sec}>
          <h2>
            <Translation
              i18nKey="marketing:volunteerDetail.main.teamTitle"
              components={{ em: <em /> }}
            />
          </h2>
          {opp.teamIntro && <p className={styles.teamIntro}>{opp.teamIntro}</p>}
          {shouldShowTeamPills && (
            <TeamPills team={opp.team} isSignedIn={isSignedIn} />
          )}
        </section>
      )}
    </div>
  );
}
