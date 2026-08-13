import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiClock, FiFlag, FiMapPin } from "react-icons/fi";
import { useSaved } from "../../app/providers/useSaved";
import { Avatar, SaveButton } from "../../shared/components/ui";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { FlatmateIdentityTags } from "./FlatmateIdentityTags";
import { FlatmateMatchReasons } from "./FlatmateMatchReasons";
import { ReportListingModal } from "./ReportListingModal";
import { SayHelloModal } from "./SayHelloModal";
import { VerificationBadge } from "./VerificationBadge";
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
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const [reporting, setReporting] = useState(false);
  const [sayingHello, setSayingHello] = useState(false);

  const savedId = `flatmate:${p.profileSlug}`;
  const saved = isSaved(savedId);

  const handleSave = () => {
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
          verified={p.verificationLevel === "id_verified"}
          size={52}
        />
        <div className={styles.identity}>
          <span className={styles.nameRow}>
            <Link to={`/members/${p.slug}`} className={styles.name}>
              {p.name}
            </Link>
            <MemberStaffBadge slug={p.slug} />
            <VerificationBadge level={p.verificationLevel} size="sm" />
            {p.matchScore != null && (
              <span className={styles.matchBadge}>
                {t("economy:flatmates.card.matchScore", {
                  score: p.matchScore,
                })}
              </span>
            )}
          </span>
          <div className={styles.pronouns}>
            {[p.pronouns, p.genderIdentity].filter(Boolean).join(" · ")}
          </div>
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
      <FlatmateMatchReasons profile={p} />
      <FlatmateIdentityTags profile={p} />
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
          <SaveButton
            saved={saved}
            onToggle={handleSave}
            label={t(
              saved
                ? "economy:flatmates.card.saved"
                : "economy:flatmates.card.save",
            )}
            size="sm"
          />
          <span
            role="button"
            tabIndex={0}
            aria-label={t("economy:flatmates.card.reportAriaLabel", {
              name: p.name,
            })}
            className={styles.reportBtn}
            onClick={handleReport}
            onKeyDown={(event) => activateOnKey(event, () => handleReport(event))}
          >
            <FiFlag aria-hidden />
          </span>
          <button
            type="button"
            className={[styles.sayBtn, sent && styles.sayBtnSent]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSayingHello(true)}
          >
            {sent ? (
              <>
                <FiCheck /> {t("economy:flatmates.card.helloSent")}
              </>
            ) : (
              <>
                {t("economy:flatmates.card.sayHello")}{" "}
                <FiArrowRight aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>

      {sayingHello && (
        <SayHelloModal
          profile={p}
          onSent={onSayHello}
          onClose={() => setSayingHello(false)}
        />
      )}

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
