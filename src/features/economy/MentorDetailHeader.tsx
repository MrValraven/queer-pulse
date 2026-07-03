import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import type { Mentor } from "./mentorship.data";
import styles from "./MentorDetailPage.module.css";

/** Portrait + name + status pills + primary CTA for a mentor profile. */
export function MentorDetailHeader({
  m,
  first,
  onRequest,
}: {
  m: Mentor;
  first: string;
  onRequest: () => void;
}) {
  const lastName = m.name.split(" ").slice(1).join(" ");
  const waitlist = m.cap.toLowerCase().includes("waitlist");
  const pills = [
    { label: m.cap, accept: !waitlist },
    { label: m.languages },
    { label: m.commitment },
    { label: m.cadence },
    ...m.areas.map((a) => ({ label: a })),
  ];

  return (
    <header className={styles.head}>
      <div
        className={styles.portrait}
        style={{ background: m.bg, color: m.color }}
        aria-hidden="true"
      >
        <span className={styles.portraitInitials}>{m.initials}</span>
      </div>
      <div>
        <div className={styles.eyebrow}>{m.eyebrow}</div>
        <h1 className={styles.name}>
          {lastName ? (
            <>
              {first} <em>{lastName}</em>
            </>
          ) : (
            m.name
          )}
        </h1>
        <p className={styles.role}>
          {m.pronouns} · {m.role}
        </p>
        <p className={styles.quote}>“{m.quote}”</p>
        <div className={styles.pills}>
          {pills.map((p) => (
            <span
              key={p.label}
              className={`${styles.pill} ${p.accept ? styles.accept : ""}`}
            >
              {p.label}
            </span>
          ))}
        </div>
        <div className={styles.cta}>
          <Button variant="primary" onClick={onRequest}>
            {m.btn}
          </Button>
          <Button variant="ghost" to={routes.messages}>
            Message {first}
          </Button>
        </div>
      </div>
    </header>
  );
}
