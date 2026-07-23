import { useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiCheck, FiClock, FiFlag, FiMapPin } from "react-icons/fi";
import { useSaved } from "../../app/providers/SavedProvider";
import { Avatar } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useSayHello } from "./api/useSayHello";
import { ReportListingModal } from "./ReportListingModal";
import type { Profile } from "./flatmates.data";
import styles from "./FlatmatesPage.module.css";

/** Enter/Space activates a `span[role=button]` exactly like a native click. */
function activateOnKey(handler: (event: SyntheticEvent) => void) {
  return (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") handler(event);
  };
}

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
  const { mutate: sendHello } = useSayHello();
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const [reporting, setReporting] = useState(false);

  const savedId = `flatmate:${p.profileSlug}`;
  const saved = isSaved(savedId);

  const handleSayHello = () => {
    sendHello(
      { slug: p.profileSlug },
      {
        onError: () =>
          showToast(t("economy:flatmates.card.sayHelloError"), "error"),
      },
    );
    onSayHello();
  };

  const handleSave = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const now = toggleSave({
      id: savedId,
      kind: "flatmate",
      title: p.name,
      href: `/members/${p.slug}`,
      meta: p.neighbourhoodLabel,
    });
    showToast(
      t(
        now ? "economy:flatmates.card.savedToast" : "economy:flatmates.card.unsavedToast",
        { name: p.name },
      ),
      now ? "success" : "info",
    );
  };

  const handleReport = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setReporting(true);
  };

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
          <span className={styles.nameRow}>
            <Link to={`/members/${p.slug}`} className={styles.name}>
              {p.name}
            </Link>
            <MemberStaffBadge slug={p.slug} />
            {p.matchScore != null && (
              <span className={styles.matchBadge}>
                {t("economy:flatmates.card.matchScore", {
                  score: p.matchScore,
                })}
              </span>
            )}
          </span>
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
        {p.since && (
          <span className={styles.since}>
            {t("economy:flatmates.card.memberSince", { date: p.since })}
          </span>
        )}
        <div className={styles.footActions}>
          <span
            role="button"
            tabIndex={0}
            aria-pressed={saved}
            aria-label={t(
              saved
                ? "economy:flatmates.card.unsaveAriaLabel"
                : "economy:flatmates.card.saveAriaLabel",
              { name: p.name },
            )}
            className={[styles.saveBtn, saved && styles.saveBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={handleSave}
            onKeyDown={activateOnKey(handleSave)}
          >
            <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
            {t(
              saved ? "economy:flatmates.card.saved" : "economy:flatmates.card.save",
            )}
          </span>
          <span
            role="button"
            tabIndex={0}
            aria-label={t("economy:flatmates.card.reportAriaLabel", {
              name: p.name,
            })}
            className={styles.reportBtn}
            onClick={handleReport}
            onKeyDown={activateOnKey(handleReport)}
          >
            <FiFlag aria-hidden />
          </span>
          <button
            type="button"
            className={[styles.sayBtn, sent && styles.sayBtnSent]
              .filter(Boolean)
              .join(" ")}
            onClick={handleSayHello}
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

      {reporting && (
        <ReportListingModal
          subjectType="flatmate"
          subjectId={p.profileSlug}
          subjectName={p.name}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}
