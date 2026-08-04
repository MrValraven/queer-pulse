import { type ReactNode } from "react";
import styles from "./StatusCard.module.css";

export interface StatusCardProps {
  /** Icon element (an inline `<svg>`, stroked to the tone colour). */
  icon: ReactNode;
  kicker?: ReactNode;
  heading: ReactNode;
  lead?: ReactNode;
  /** Icon-tile colour: "accent" (default), "jade", or "plum". */
  tone?: string;
  actions?: ReactNode;
  foot?: ReactNode;
  /** Body content between the lead and the actions (detail lists, panels). */
  children?: ReactNode;
}

const iconToneClass: Record<string, string | undefined> = {
  accent: undefined,
  jade: styles.iconJade,
  plum: styles.iconPlum,
};

/**
 * The inner card for full-page system states — icon tile, kicker, serif
 * heading, lead, body, actions and foot. Consolidates the repeated `.card`
 * markup+CSS across the account-suspended/banned/locked and pending-review
 * pages (and the other state screens). System pages keep wrapping this in
 * `SystemStateShell`, which owns the cream backdrop, orbs and brand mark.
 */
export function StatusCard({
  icon,
  kicker,
  heading,
  lead,
  tone = "accent",
  actions,
  foot,
  children,
}: StatusCardProps) {
  return (
    <div className={styles.card}>
      <div
        className={[styles.icon, iconToneClass[tone]].filter(Boolean).join(" ")}
      >
        {icon}
      </div>
      {kicker != null && kicker !== "" && (
        <div className={styles.kicker}>{kicker}</div>
      )}
      <h1 className={styles.heading}>{heading}</h1>
      {lead != null && lead !== "" && <p className={styles.lead}>{lead}</p>}
      {children}
      {actions && <div className={styles.actions}>{actions}</div>}
      {foot && <div className={styles.foot}>{foot}</div>}
    </div>
  );
}
