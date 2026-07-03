import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
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
  const contactName = profile.hiringContact.name;
  const isPerson = !/team|founders|programmes/i.test(contactName);
  const messageLabel = isPerson
    ? `Message ${contactName.split(" ")[0]}`
    : "Send a message";
  return (
    <aside className={styles.side}>
      <div className={styles.sideCard}>
        <h4>Studio details</h4>
        {profile.info.map((row) => (
          <div key={row.label} className={styles.infoRow}>
            <span>{row.label}</span>
            <b>{row.value}</b>
          </div>
        ))}
      </div>

      <div className={styles.sideCard}>
        <h4>People here on QueerPulse</h4>
        <div className={styles.team}>
          {profile.team.map((av) => (
            <div
              key={av.initials}
              className={[styles.teamAv, avClass[av.tone ?? "coral"]]
                .filter(Boolean)
                .join(" ")}
            >
              {av.initials}
            </div>
          ))}
        </div>
        <p className={styles.teamMore}>
          <Link to={`${routes.members}?co=${profile.slug}`}>
            {profile.membersLabel}
          </Link>
        </p>
      </div>

      <div className={styles.sideCard}>
        <h4>Hiring contact</h4>
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
    </aside>
  );
}
