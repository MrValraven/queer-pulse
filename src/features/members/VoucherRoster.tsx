import { Link } from "react-router-dom";
import { FiChevronUp } from "react-icons/fi";
import { Avatar, Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type { VoucherFace } from "./api/useVouchers";
import styles from "./VoucherRoster.module.css";

/** Diameter of the avatar on one roster chip, in px. */
const CHIP_AVATAR_SIZE = 28;
/** Above this many vouchers the roster scrolls inside a fixed height. */
const SCROLL_THRESHOLD = 24;

/** One voucher in the roster: avatar and name, linked to their profile. An
 *  anonymous voucher has nowhere to go and stays a plain labelled span. */
function VoucherChip({ face }: { face: VoucherFace }) {
  const { t } = useTranslation();
  if (face.anonymous) {
    const anonymousName = t("members:hero.vouch.anonymous");
    return (
      <span className={styles.chip}>
        <Avatar
          initials={face.initials}
          tint={face.tint}
          size={CHIP_AVATAR_SIZE}
          alt={anonymousName}
        />
        <span className={styles.chipName}>{anonymousName}</span>
      </span>
    );
  }
  return (
    <Link to={`/members/${face.slug}`} className={styles.chipLink}>
      <Avatar
        initials={face.initials}
        tint={face.tint}
        size={CHIP_AVATAR_SIZE}
        src={face.avatarUrl}
        alt=""
      />
      <span className={styles.chipName}>{face.name}</span>
      <MemberStaffBadge slug={face.slug} />
    </Link>
  );
}

/**
 * The full voucher roster under the hero's vouch row: a wrapped list of compact
 * chips inside the shared `Collapse`. A long roster scrolls inside a fixed
 * height with a soft fade at the bottom. "Show less" closes it again.
 */
export function VoucherRoster({
  faces,
  totalCount,
  isOpen,
  rosterId,
  onClose,
}: {
  faces: VoucherFace[];
  /** The member's true vouch tally, which can exceed `faces.length`. */
  totalCount: number;
  isOpen: boolean;
  rosterId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isScrollable = faces.length > SCROLL_THRESHOLD;
  return (
    <Collapse isOpen={isOpen}>
      <div id={rosterId} className={styles.roster}>
        <ul
          className={isScrollable ? styles.listScrollable : styles.list}
          aria-label={t("members:hero.vouch.rosterLabel")}
        >
          {faces.map((face, index) => (
            <li key={face.anonymous ? `anon-${index}` : face.slug}>
              <VoucherChip face={face} />
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          {totalCount > faces.length && (
            <span className={styles.partial}>
              {t("members:hero.vouch.rosterPartial", {
                shown: faces.length,
                total: totalCount,
              })}
            </span>
          )}
          <button type="button" className={styles.lessButton} onClick={onClose}>
            {t("members:hero.vouch.showLess")}
            <FiChevronUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </Collapse>
  );
}
