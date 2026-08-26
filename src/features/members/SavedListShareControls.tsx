import {
  FiAlertTriangle,
  FiGlobe,
  FiLink2,
  FiLock,
  FiSlash,
} from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatRelative } from "../../shared/lib/date";
import { sharedSavedListUrl, type SavedListDTO } from "./api/SavedLists.api";
import styles from "./SavedListShareControls.module.css";

/**
 * The off state: what a link would mean, said before one exists.
 *
 * The backend's shared read is `@Public()`. Anyone holding the URL can open it
 * with no account, which is the point (a friend who has just moved to the city
 * may not have one yet) and is also the risk, because a list of queer venues is
 * a record of where a person goes. So the panel says all of it plainly, and the
 * link only comes into existence when the member presses the button.
 */
function SavedListSharePrivate({
  onShare,
  isSharing,
}: {
  onShare: () => void;
  isSharing: boolean;
}) {
  const { t } = useTranslation();

  return (
    <section className={`${styles.panel} ${styles.private}`}>
      <h3 className={styles.head}>
        <FiLock aria-hidden />
        {t("members:savedLists.share.private.heading")}
      </h3>
      <p className={styles.body}>
        {t("members:savedLists.share.private.body")}
      </p>
      <p className={styles.warning}>
        <FiAlertTriangle aria-hidden />
        {t("members:savedLists.share.private.warning")}
      </p>
      <ul className={styles.points}>
        <li>{t("members:savedLists.share.points.noAccount")}</li>
        <li>{t("members:savedLists.share.points.anonymous")}</li>
        <li>{t("members:savedLists.share.points.revocable")}</li>
      </ul>
      <div className={styles.actions}>
        <Button variant="primary" onClick={onShare} disabled={isSharing}>
          <FiLink2 aria-hidden /> {t("members:savedLists.share.private.cta")}
        </Button>
      </div>
    </section>
  );
}

/**
 * The on state: the link itself, and one button that kills it.
 *
 * Revoking is deliberately a single press with no confirm step. Everything a
 * confirm dialog protects against here is recoverable (make another link), and
 * the thing it would delay is somebody trying to take a link back, which has to
 * be instant. The backend clears the stored token, and the shared read sends no
 * `Cache-Control`, so no CDN copy outlives the revoke.
 */
function SavedListShareLive({
  list,
  onRevoke,
  isRevoking,
}: {
  list: SavedListDTO;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const shareUrl = list.shareToken ? sharedSavedListUrl(list.shareToken) : "";

  return (
    <section className={`${styles.panel} ${styles.shared}`}>
      <h3 className={styles.head}>
        <FiGlobe aria-hidden />
        {t("members:savedLists.share.live.heading")}
      </h3>
      <p className={styles.body}>{t("members:savedLists.share.live.body")}</p>
      <CopyLinkRow
        value={shareUrl}
        tone="plum"
        fieldLabel={t("members:savedLists.share.live.fieldLabel")}
        copyLabel={t("members:savedLists.share.live.copy")}
        copiedLabel={t("members:savedLists.share.live.copied")}
        copiedToast={t("members:savedLists.share.live.copiedToast")}
        errorToast={t("members:savedLists.share.live.copyErrorToast")}
      />
      <div className={styles.actions}>
        <Button variant="ghost-dark" onClick={onRevoke} disabled={isRevoking}>
          <FiSlash aria-hidden /> {t("members:savedLists.share.live.revoke")}
        </Button>
        {list.sharedAt && (
          <span className={styles.since}>
            {t("members:savedLists.share.live.since", {
              time: formatRelative(list.sharedAt, formatters),
            })}
          </span>
        )}
      </div>
    </section>
  );
}

/**
 * Share and revoke for one saved list. Sharing is off until asked for and one
 * press away from off again, mirroring the API exactly: `POST .../share` mints
 * a token and is idempotent, `DELETE .../share` clears it and every copy of the
 * URL in the world stops resolving.
 */
export function SavedListShareControls({
  list,
  onShare,
  onRevoke,
  isSharing = false,
  isRevoking = false,
}: {
  list: SavedListDTO;
  onShare: () => void;
  onRevoke: () => void;
  isSharing?: boolean;
  isRevoking?: boolean;
}) {
  return list.isShared && list.shareToken ? (
    <SavedListShareLive
      list={list}
      onRevoke={onRevoke}
      isRevoking={isRevoking}
    />
  ) : (
    <SavedListSharePrivate onShare={onShare} isSharing={isSharing} />
  );
}
