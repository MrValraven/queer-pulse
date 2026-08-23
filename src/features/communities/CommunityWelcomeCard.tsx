import { useEffect, useRef, useState } from "react";
import { FiHeart, FiX } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useCommunityPreferences,
  useMarkCommunityWelcomeSeen,
} from "./api/useCommunityPreferences";
import styles from "./CommunityWelcomeCard.module.css";

/**
 * The greeting a newly approved member gets once, at the top of Pulse, before
 * the composer and whatever the last person happened to post.
 *
 * Written to read as somebody saying hello rather than as a system notice: the
 * community's own words are the body, the platform only frames them. The
 * server decides whether it is owed (`shouldShowWelcome` is already the whole
 * rule: never stamped AND the community actually authored a greeting), so a
 * community that never wrote one renders NOTHING here, never an empty frame.
 *
 * Keyed by slug at the call site, so moving to another community is a fresh
 * instance rather than state that has to be reset by hand.
 *
 * `POST /welcome-seen` fires once the card has actually rendered, not on
 * mount of the tab, so a member who never reached the community still gets
 * greeted next time. The card stays on screen after the stamp: the write is
 * bookkeeping for the NEXT visit, and pulling the greeting out from under
 * someone mid-read would be the opposite of a welcome.
 */
export function CommunityWelcomeCard({
  slug,
  communityName,
}: {
  slug: string;
  communityName: string;
}) {
  const { t } = useTranslation();
  const preferences = useCommunityPreferences(slug);
  const markSeen = useMarkCommunityWelcomeSeen(slug);
  const [isDismissed, setIsDismissed] = useState(false);
  // One stamp per mount, whatever re-renders happen underneath it.
  const hasStampedRef = useRef(false);

  const welcomeMessage = preferences.welcomeMessage?.trim() ?? "";
  const isShowing = preferences.shouldShowWelcome && welcomeMessage.length > 0;

  useEffect(() => {
    if (!isShowing || hasStampedRef.current) return;
    hasStampedRef.current = true;
    markSeen.mutate();
    // `markSeen` is a fresh mutation object each render; keying the effect to
    // the render-visible condition (plus the one-shot ref) is what keeps this
    // to a single write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowing]);

  if (!isShowing || isDismissed) return null;

  return (
    <aside className={styles.card}>
      <span className={styles.icon} aria-hidden>
        <FiHeart />
      </span>
      <div className={styles.body}>
        <p className={styles.greeting}>
          {t("communities:detail.welcome.greeting", { name: communityName })}
        </p>
        <p className={styles.message}>{welcomeMessage}</p>
      </div>
      <IconButton
        className={styles.dismiss}
        size="sm"
        aria-label={t("communities:detail.welcome.dismissAria")}
        onClick={() => setIsDismissed(true)}
      >
        <FiX aria-hidden />
      </IconButton>
    </aside>
  );
}
