import type { SyntheticEvent } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { activateOnKey } from "../../shared/lib/activateOnKey";
import { routes } from "../../app/routeMap";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { BADGE_KEY, getMemberInfo, postedDaysText } from "./barter.data";
import type { BarterView } from "./api/barter.adapters";
import styles from "./BarterPage.module.css";

interface Props {
  barter: BarterView;
}

export function BarterCard({ barter: b }: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const info = getMemberInfo(b);

  // Demo-only shortcut. In live mode a proposal is a real write with real
  // refusals, so the card links through to the detail page's propose form
  // rather than sending anything from here.
  function propose(e: SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    showToast(
      t("economy:barter.toast.messageSent", { name: info.name }),
      "success",
    );
  }

  return (
    <Link to={`${routes.barter}/${b.id}`} className={styles.bc}>
      <div className={styles.bcHead}>
        <Avatar
          initials={info.initials}
          tint={info.tint}
          size={40}
          src={b.avatarUrl ?? undefined}
        />
        <div className={styles.bcMeta}>
          <div className={styles.nameRow}>
            <div className={styles.bcName}>{info.name}</div>
            <MemberStaffBadge slug={b.member} />
          </div>
          {/* Only when the poster actually shares a neighbourhood. A member who
              keeps theirs private gets no line at all, never a stand-in. */}
          {info.hood && <div className={styles.bcHood}>{info.hood}</div>}
        </div>
        <span className={`${styles.bcBadge} ${styles[b.mode]}`}>
          {t(BADGE_KEY[b.mode])}
        </span>
      </div>
      {b.offer && (
        <div className={`${styles.bcBlock} ${styles.bcOffer}`}>
          <div className={styles.bcLabel}>
            {t("economy:barter.card.offeringLabel")}
          </div>
          <div className={styles.bcSkill}>{b.offer}</div>
          <div className={styles.bcDesc}>{b.offerDetail}</div>
        </div>
      )}
      {b.want && (
        <div className={`${styles.bcBlock} ${styles.bcWant}`}>
          <div className={styles.bcLabel}>
            {t("economy:barter.card.wantLabel")}
          </div>
          <div className={styles.bcSkill}>{b.want}</div>
          <div className={styles.bcDesc}>{b.wantDetail}</div>
        </div>
      )}
      <div className={styles.btags}>
        {b.tags.map((tag) => (
          <span key={tag} className={styles.btag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.bcFoot}>
        <span className={styles.bcDays}>{postedDaysText(b.days, t)}</span>
        {demoMode ? (
          <span
            role="button"
            tabIndex={0}
            className={styles.bcReach}
            onClick={propose}
            onKeyDown={(e) => activateOnKey(e, () => propose(e))}
          >
            {t("economy:barter.card.proposeCta")} <FiArrowRight aria-hidden />
          </span>
        ) : (
          <span className={styles.bcReach}>
            {b.isOwner
              ? t("economy:barter.card.yoursCta")
              : t("economy:barter.card.proposeCta")}{" "}
            <FiArrowRight aria-hidden />
          </span>
        )}
      </div>
    </Link>
  );
}
