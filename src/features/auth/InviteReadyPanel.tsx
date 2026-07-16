import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { currentUser } from "../members/data/members";
import type { CreatedInvite } from "./api/useCreateInvite";
import { SHARE_TARGETS, buildShareMessage } from "./invite.data";
import { expiryLabel } from "./inviteLinkPanel.data";
import styles from "./InvitePage.module.css";

/** Ready: the invite exists. Quiet plum success panel with the live link. */
export function InviteReadyPanel({ invite }: { invite: CreatedInvite }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const message = buildShareMessage(t, currentUser.first, invite.fullUrl);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(invite.fullUrl);
      setCopied(true);
      showToast(t("auth:invite.ready.linkCopied"), "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(t("auth:invite.ready.copyFailed"), "error");
    }
  }

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

      <div className={styles.readyLinkRow}>
        <input
          className={styles.readyLinkField}
          type="text"
          readOnly
          value={invite.url}
        />
        <button
          type="button"
          className={`${styles.readyCopyBtn} ${copied ? styles.readyCopyBtnDone : ""}`}
          onClick={copyLink}
          aria-label={
            copied
              ? t("auth:invite.ready.linkCopied")
              : t("auth:invite.ready.copyLinkAriaLabel")
          }
        >
          {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
          {copied ? t("auth:common.copied") : t("auth:common.copy")}
        </button>
      </div>

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
