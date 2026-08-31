import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./JoinRequestStatus.module.css";

/**
 * One frame for every state: icon tile, eyebrow, serif heading, lead, body,
 * actions and a foot line. Keeps every screen on this route visually identical
 * apart from the words, which is the whole point of a page people arrive at
 * anxious.
 *
 * Lives in its own file so the approved states can share it without either
 * component file growing past what a person can hold in their head.
 */
export function StatusState({
  icon,
  tone = "accent",
  eyebrow,
  title,
  lead,
  children,
  actions,
  foot,
}: {
  icon: ReactNode;
  tone?: "accent" | "jade" | "quiet";
  eyebrow: string;
  /** Rendered as the page's `<h1>`; carries the coral `<em>` idiom. */
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  foot?: ReactNode;
}) {
  const toneClass =
    tone === "jade"
      ? styles.iconJade
      : tone === "quiet"
        ? styles.iconQuiet
        : undefined;
  return (
    <div className={styles.state}>
      <div className={[styles.icon, toneClass].filter(Boolean).join(" ")}>
        {icon}
      </div>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
      {actions && <div className={styles.actions}>{actions}</div>}
      {foot && <div className={styles.foot}>{foot}</div>}
    </div>
  );
}

/** "Get in touch" — every state offers one, so nobody is ever left with only
 *  a back button. */
export function ContactLink() {
  const { t } = useTranslation();
  return (
    <Link to={routes.contact}>{t("auth:joinRequestStatus.contactCta")}</Link>
  );
}
