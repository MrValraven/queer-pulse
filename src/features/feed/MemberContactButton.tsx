import type { JSX } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import styles from "./MemberContactButton.module.css";

/**
 * The one action on a feed member card. A connection gets the tonal "Say hi",
 * which opens the message thread; anyone else gets "Connect" (flat coral by
 * default, tonal with `tone="soft"`), which opens the Connect modal (or its accept/decline panel when this member
 * has already asked). The signed-in member's own card, and an actor with no
 * slug to address, get no button at all.
 *
 * Both accessible names carry the person, so a screen reader listing a page
 * of cards hears who each button is for.
 *
 * `tone` sets the "Connect" weight: `solid` (the default) is the flat coral
 * fill, `soft` the tonal fill for rows that hold several buttons at once.
 * "Say hi" is always tonal.
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
