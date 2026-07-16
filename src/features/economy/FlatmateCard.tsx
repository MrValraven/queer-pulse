import { Link } from "react-router-dom";
import { FiCheck, FiClock, FiMapPin } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

export function FlatmateCard({
  p,
  sent,
  onSayHello,
}: {
  p: Profile;
  sent: boolean;
  onSayHello: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <Avatar
          initials={p.initials}
          tint={p.tint}
          src={p.photo}
          alt={p.name}
          verified={p.verified}
          size={52}
        />
        <div className={styles.identity}>
          <Link to={`/members/${p.slug}`} className={styles.name}>
            {p.name}
          </Link>
          <div className={styles.pronouns}>{p.pronouns}</div>
        </div>
        <span
          className={[
            styles.badge,
            p.type === "seeking" ? styles.badgeSeeking : styles.badgeOffering,
          ].join(" ")}
        >
          {p.type === "seeking"
            ? t("economy:flatmates.filter.seeking")
            : t("economy:flatmates.filter.offering")}
        </span>
      </div>
      <div className={styles.details}>
        <span className={styles.detail}>
          <FiMapPin /> {p.neighbourhoodLabel}
        </span>
        <span className={styles.detail}>
          <FiClock /> {p.movein}
        </span>
        <span className={styles.detail}>{p.budget}</span>
      </div>
      <p className={styles.note}>{p.note}</p>
      <div className={styles.tags}>
        {p.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.foot}>
        <span className={styles.since}>
          {t("economy:flatmates.card.memberSince", { date: p.since })}
        </span>
        <button
          type="button"
          className={[styles.sayBtn, sent && styles.sayBtnSent]
            .filter(Boolean)
            .join(" ")}
          onClick={onSayHello}
        >
          {sent ? (
            <>
              <FiCheck /> {t("economy:flatmates.card.helloSent")}
            </>
          ) : (
            t("economy:flatmates.card.sayHello")
          )}
        </button>
      </div>
    </div>
  );
}
