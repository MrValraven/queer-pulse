import { FiCheck } from "react-icons/fi";
import { Button, CopyLinkRow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CreatedInvite } from "./api/useCreateInvite";
import { SHARE_TARGETS, buildShareMessage } from "./invite.data";
import { expiryLabel } from "./inviteLinkPanel.data";
import { InviteQrCode } from "./InviteQrCode";
import { useInviteSender } from "./useInviteSender";
import styles from "./InvitePage.module.css";

/** Ready: the invite exists. Quiet plum success panel with the live link. */
export function InviteReadyPanel({ invite }: { invite: CreatedInvite }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sender = useInviteSender();
  const message = buildShareMessage(t, sender.first, invite.fullUrl);

  return (
    <div className={`${styles.ready} ${styles.screenIn}`}>
      <div className={styles.readyIcon} aria-hidden>
        <FiCheck />
      </div>
      <h2 className={styles.readyHead}>
        <Translation
          i18nKey="auth:invite.ready.headline"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.readySub}>{t("auth:invite.ready.sub")}</p>

      <CopyLinkRow
        className={styles.readyLinkRow}
        tone="plum"
        value={invite.fullUrl}
        display={invite.url}
        copyLabel={t("auth:common.copy")}
        copiedLabel={t("auth:common.copied")}
        copiedToast={t("auth:invite.ready.linkCopied")}
        errorToast={t("auth:invite.ready.copyFailed")}
      />

      <div className={styles.readyShare}>
        <span className={styles.readyShareLabel}>
          {t("auth:invite.ready.shareThrough")}
        </span>
        <div className={styles.readyShareTargets}>
          {SHARE_TARGETS.map(({ key, label, Icon, build }) => (
            <a
              key={key}
              className={styles.readyShareChip}
              href={build(message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon aria-hidden />
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className={styles.readyQr}>
        <InviteQrCode
          value={invite.fullUrl}
          label={t("auth:invite.ready.qrLabel")}
          className={styles.readyQrTile}
        />
        <span className={styles.readyQrHint}>
          {t("auth:invite.ready.qrHint")}
        </span>
      </div>

      <div className={styles.readyMeta}>
        {t("auth:invite.ready.oneTimeLink")} ·{" "}
        {expiryLabel(invite.expiresAt, t, fmt)}
      </div>

      <Button
        variant="ghost-dark"
        to={routes.accountProfile}
        className={styles.readyDone}
      >
        {t("auth:common.backToProfile")}
      </Button>
    </div>
  );
}
