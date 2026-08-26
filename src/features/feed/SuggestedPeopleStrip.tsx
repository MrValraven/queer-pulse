import { FiArrowRight, FiUserPlus, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import { useLocalStorage } from "../../shared/hooks/useLocalStorage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useSuggestedPeople } from "./SuggestedPeople.api";
import { SuggestedPeopleCard } from "./SuggestedPeopleCard";
import styles from "./SuggestedPeople.module.css";

/**
 * Where a member's "I hid this strip" preference lives.
 *
 * Per DEVICE, not per account, and that is the right level: hiding a strip is
 * a statement about this screen, while dismissing a PERSON is a statement
 * about that person and is stored on the server so it follows them everywhere.
 * The two are kept apart on purpose.
 */
const STRIP_HIDDEN_KEY = "qp.suggestedPeople.hidden";

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

function StripSkeleton({ count }: { count: number }) {
  return (
    <div className={styles.grid} aria-hidden>
      {Array.from({ length: count }).map((_unused, index) => (
        <div key={index} className={styles.card}>
          <SkeletonAvatar size={56} />
          <SkeletonLine width="60%" height={14} style={{ marginTop: 12 }} />
          <SkeletonLine width="80%" height={12} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/**
 * "People you might know" (SOC-05).
 *
 * Renders NOTHING when the server has nobody to suggest, which is the honest
 * answer for a member who has joined nothing, connected with nobody and
 * written nothing about themselves. There is no filler of strangers: every
 * card here can say why it is here, or it does not appear.
 *
 * Two independent ways out. The X on a card is a real dismissal, remembered on
 * the server so that person is never offered again. The X on the header hides
 * the whole strip on this device. Neither blocks, mutes or tells anyone: the
 * dismissed member keeps every bit of reach they had.
 */
export function SuggestedPeopleStrip({
  limit = 6,
  /** `true` on the connections empty state, where the strip IS the content
   *  and hiding it would leave a blank page. */
  isPersistent = false,
}: {
  limit?: number;
  isPersistent?: boolean;
}) {
  const { t } = useTranslation();
  const [isHidden, setHidden] = useLocalStorage<boolean>(
    STRIP_HIDDEN_KEY,
    false,
    isBoolean,
  );
  const { people, isLoading, isError, dismiss } = useSuggestedPeople(limit);

  if (!isPersistent && isHidden) return null;
  if (isError) return null;
  if (isLoading) {
    return (
      <section className={styles.strip}>
        <div className={styles.head}>
          <FiUserPlus aria-hidden className={styles.headIcon} />
          <h2 className={styles.title}>{t("connect:suggested.heading")}</h2>
        </div>
        <StripSkeleton count={Math.min(limit, 4)} />
      </section>
    );
  }
  if (!people.length) return null;

  return (
    <section className={styles.strip}>
      <div className={styles.head}>
        <FiUserPlus aria-hidden className={styles.headIcon} />
        <div>
          <h2 className={styles.title}>{t("connect:suggested.heading")}</h2>
          <p className={styles.blurb}>{t("connect:suggested.blurb")}</p>
        </div>
        {!isPersistent && (
          <button
            type="button"
            className={styles.hide}
            aria-label={t("connect:suggested.hideStripAria")}
            onClick={() => setHidden(true)}
          >
            <FiX aria-hidden />
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {people.map((person) => (
          <SuggestedPeopleCard
            key={person.slug}
            person={person}
            onDismiss={dismiss}
          />
        ))}
      </div>
      <Link to={routes.members} className={styles.browse}>
        {t("connect:suggested.browseMembers")} <FiArrowRight aria-hidden />
      </Link>
    </section>
  );
}
