import { FiLock } from "react-icons/fi";
import { Button, Card } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionsHydrated } from "../../app/providers/useConnections";
import { useMemberContact } from "../connect/useMemberContact";
import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";
import styles from "./ProfileLimitedNote.module.css";

/**
 * Which sentences a limited card gets. The backend has two distinct reasons
 * for withholding a profile (`ProfilesService.canViewFull`): `network` means
 * "accepted connections see the rest", `private` means "nobody but me does".
 * Those are different boundaries and they get different words — telling a
 * stranger to connect for more would be a promise a private profile never
 * keeps.
 *
 * `open` never produces a limited card, so its row is only a safe landing
 * place for an unexpected value: it says less rather than saying the wrong
 * thing.
 */
const COPY_KEYS: Record<VisibilityMode, { title: string; body: string }> = {
  network: {
    title: "members:profile.limited.network.title",
    body: "members:profile.limited.network.body",
  },
  private: {
    title: "members:profile.limited.private.title",
    body: "members:profile.limited.private.body",
  },
  open: {
    title: "members:profile.limited.generic.title",
    body: "members:profile.limited.generic.body",
  },
};

/**
 * The note under the hero of a profile the server returned as `limited: true`.
 *
 * Without it the page is a hero and then nothing at all, which reads as an
 * abandoned account instead of a boundary somebody chose. This says whose
 * choice it was, in the member's own terms, and offers the one action that
 * actually changes anything: the connection request, for every tier that still
 * takes one.
 *
 * It never names or counts what is behind the boundary. The viewer's client
 * was not told, and guessing at "12 photos hidden" would leak the shape of a
 * profile the member deliberately closed.
 */
export function ProfileLimitedNote({
  slug,
  firstName,
  visibility,
}: {
  slug: string;
  /** Just the first name: the whole note speaks about this person, warmly. */
  firstName: string;
  visibility: VisibilityMode;
}) {
  const { t } = useTranslation();
  const { connected, hasIncomingRequest, contact } = useMemberContact(slug);
  const { isPending } = useConnectionsHydrated();
  const copy = COPY_KEYS[visibility] ?? COPY_KEYS.open;
  const hasSentRequest = isPending(slug);
  const canReachOut = visibility !== "private" || hasIncomingRequest;
  // A private member who already asked to connect is waiting for an answer, so
  // the body speaks to that request.
  const bodyKey =
    visibility === "private" && hasIncomingRequest
      ? "members:profile.limited.private.incomingBody"
      : copy.body;

  return (
    <div className="wrap">
      <Card
        as="aside"
        padding="md"
        className={styles.card}
        aria-label={t("members:profile.limited.ariaLabel")}
      >
        <span className={styles.icon} aria-hidden>
          <FiLock />
        </span>
        <h2 className={styles.title}>{t(copy.title, { name: firstName })}</h2>
        <p className={styles.body}>{t(bodyKey, { name: firstName })}</p>
        {hasSentRequest && (
          <p className={styles.status}>
            {t("members:profile.limited.requestSent", { name: firstName })}
          </p>
        )}
        {/* PRD-506. A private member does not take new requests, so the note
            ends on its sentence. The one button a private profile can still
            show answers a request that member already sent. Connected and
            still limited also ends on the sentence. */}
        {!hasSentRequest && !connected && canReachOut && (
          <Button
            variant="primary"
            onClick={() => contact({ slug, name: firstName })}
          >
            {hasIncomingRequest
              ? t("members:profile.limited.answerRequest", { name: firstName })
              : t("members:profile.limited.askToConnect")}
          </Button>
        )}
      </Card>
    </div>
  );
}
