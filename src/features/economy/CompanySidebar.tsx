import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import type { CompanyProfile } from "./companies.data";
import styles from "./CompanyPage.module.css";

const avClass: Record<
  NonNullable<CompanyProfile["team"][number]["tone"]>,
  string | undefined
> = {
  coral: "",
  jade: styles.teamAvJade,
  plum: styles.teamAvPlum,
};

export function CompanySidebar({ profile }: { profile: CompanyProfile }) {
  const { t } = useTranslation();
  const contactName = profile.hiringContact.name;
  const isPerson = !/team|founders|programmes/i.test(contactName);
  const messageLabel = isPerson
    ? t("economy:company.sidebar.messagePerson", {
        name: contactName.split(" ")[0],
      })
    : t("economy:company.sidebar.sendMessage");
  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <h4>{t("economy:company.sidebar.detailsTitle")}</h4>
        {profile.info.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span>{row.label}</span>
            <b>{row.value}</b>
          </div>
        ))}
      </div>

      <div className={styles.sideCard}>
        <h4>{t("economy:company.sidebar.peopleTitle")}</h4>
        <div className={styles.team}>
          {profile.team.map((teamMember) => (
            <div
              key={teamMember.initials}
              className={[styles.teamAv, avClass[teamMember.tone ?? "coral"]]
                .filter(Boolean)
                .join(" ")}
            >
              {teamMember.initials}
            </div>
          ))}
        </div>
        <p className={styles.teamMore}>
          <Link to={`${routes.members}?co=${profile.slug}`}>
            {profile.membersLabel} <FiArrowRight aria-hidden />
          </Link>
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4>{t("economy:company.sidebar.hiringContactTitle")}</h4>
        <p className={styles.contactName}>{profile.hiringContact.name}</p>
        <p className={styles.contactRole}>{profile.hiringContact.role}</p>
        <Button
          variant="ghost"
          to={routes.messages}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "10px 16px",
            fontSize: 13,
          }}
        >
          {messageLabel}
        </Button>
      </div>

      <ReportSubjectControl
        subjectType="company"
        subjectId={profile.slug}
        subjectName={profile.nameText}
        label={t("economy:company.report.cta")}
        ariaLabel={t("economy:company.report.ariaLabel", {
          name: profile.nameText,
        })}
      />
    </aside>
  );
}
