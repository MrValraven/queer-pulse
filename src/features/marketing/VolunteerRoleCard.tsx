import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { VolunteerOpportunity } from "./volunteerOpportunities.types";
import s from "./VolunteerPage.module.css";

export function VolunteerCardSkeleton() {
  // Mirrors the real .card: org row (40px avatar + name/cause), role, desc, meta pills, skills, foot.
  return (
    <div className={s.card} aria-hidden>
      <div className={s.org}>
        <SkeletonLine
          width={40}
          height={40}
          style={{ borderRadius: 10, flex: "none" }}
        />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="55%" height={14} />
          <SkeletonLine width="35%" height={12} style={{ marginTop: 5 }} />
        </div>
      </div>
      <SkeletonLine width="75%" height={19} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="100%" height={13.5} />
        <SkeletonLine width="85%" height={13.5} style={{ marginTop: 6 }} />
      </div>
      <div className={s.metaRow}>
        <SkeletonLine width={120} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width={70} height={20} style={{ borderRadius: 6 }} />
      </div>
      <div className={s.cardFoot} style={{ borderTopColor: "transparent" }}>
        <SkeletonLine width={90} height={13} />
        <SkeletonLine width={110} height={30} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}

export interface VolunteerRoleCardProps {
  opportunity: VolunteerOpportunity;
  /** Staggered entrance delay in milliseconds. */
  delay: number;
}

/** One open role in the volunteering grid. */
export function VolunteerRoleCard({
  opportunity,
  delay,
}: VolunteerRoleCardProps) {
  const { t } = useTranslation();

  return (
    <FadeIn delay={delay} style={{ height: "100%" }}>
      <div className={s.card} style={{ height: "100%" }}>
        <div className={s.org}>
          <span
            className={s.orgAv}
            style={{
              background: opportunity.background,
              color: opportunity.color,
            }}
          >
            {opportunity.avatar}
          </span>
          <div>
            <div className={s.orgName}>{opportunity.org}</div>
            <div className={s.orgCause}>{opportunity.cause}</div>
          </div>
        </div>
        <div className={s.role}>{opportunity.role}</div>
        <p className={s.desc}>{opportunity.description}</p>
        <div className={s.metaRow}>
          <span
            className={`${s.commit} ${opportunity.commit === "low" ? s.commitGreen : s.commitAmber}`}
          >
            {opportunity.commit === "low"
              ? t("marketing:volunteer.card.commitLow")
              : t("marketing:volunteer.card.commitMedium")}
          </span>
          <span className={s.metaPill}>{opportunity.location}</span>
        </div>
        <div className={s.skills}>
          {opportunity.skills.map((skill) => (
            <span key={skill} className={s.skill}>
              #{skill}
            </span>
          ))}
        </div>
        <div className={s.cardFoot}>
          <span className={s.time}>{opportunity.time}</span>
          <Link
            className={s.express}
            to={`${routes.volunteer}/opportunity/${opportunity.slug}`}
          >
            {t("marketing:volunteer.card.expressInterest")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
