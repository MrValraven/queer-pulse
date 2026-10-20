import type { JSX } from "react";
import { FiClock } from "react-icons/fi";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import styles from "./MemberContactButton.module.css";

/**
 * The one action on a feed member card, in three states. A connection gets the
 * tonal "Say hi", which opens the message thread. A member you have already
 * asked gets the tonal "Pending" with a clock, read from the sent requests the
 * server reports, so it survives a refresh; it still opens the Connect modal,
 * which shows the "already reached out" notice. Anyone else gets "Connect"
 * (flat coral by default, tonal with `tone="soft"`), which opens the Connect
 * modal (or its accept/decline panel when this member has already asked). The
 * signed-in member's own card, and an actor with no slug to address, get no
 * button at all.
 *
 * Every accessible name carries the person, so a screen reader listing a page
 * of cards hears who each button is for.
 *
 * `tone` sets the "Connect" weight: `solid` (the default) is the flat coral
 * fill, `soft` the tonal fill for rows that hold several buttons at once.
 * "Say hi" and "Pending" are always tonal.
 */
export function MemberContactButton({
  slug,
  name,
  tone = "solid",
}: {
  slug: string;
  name: string;
  tone?: "solid" | "soft";
}): JSX.Element | null {
  const { t } = useTranslation();
  const { connected, isSelf, contact } = useMemberContact(slug);
  const { isPending } = useConnectionsHydrated();
  const hasSentRequest = !connected && isPending(slug);
  if (slug === "" || isSelf) return null;

  if (connected) {
    return (
      <Button
        variant="soft"
        size="sm"
        className={styles.contact}
        aria-label={t("feed:memberCard.action.sayHiAria", { name })}
        onClick={() => contact({ slug, name })}
      >
        {t("feed:memberCard.action.sayHi")}
      </Button>
    );
  }
  if (hasSentRequest) {
    return (
      <Button
        variant="soft"
        size="sm"
        className={styles.contact}
        aria-label={t("feed:memberCard.action.pendingAria", { name })}
        onClick={() => contact({ slug, name })}
      >
        <FiClock aria-hidden /> {t("feed:memberCard.action.pending")}
      </Button>
    );
  }
  const isSoft = tone === "soft";
  return (
    <Button
      variant={isSoft ? "soft" : "primary"}
      size="sm"
      className={isSoft ? styles.contact : `${styles.contact} ${styles.flat}`}
      aria-label={t("feed:memberCard.action.connectAria", { name })}
      onClick={() => contact({ slug, name })}
    >
      {t("feed:action.connect")}
    </Button>
  );
}
