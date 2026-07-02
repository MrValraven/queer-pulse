import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { currentUser } from "../members/data/members";
import type { CreatedInvite } from "./api/useCreateInvite";
import { SHARE_TARGETS, buildShareMessage } from "./invite.data";
import { expiryLabel } from "./inviteLinkPanel.data";
import styles from "./InvitePage.module.css";

/** Ready: the invite exists. Quiet plum success panel with the live link. */
export function InviteReadyPanel({ invite }: { invite: CreatedInvite }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const message = buildShareMessage(currentUser.first, invite.fullUrl);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(invite.fullUrl);
      setCopied(true);
      showToast("Link copied", "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Couldn’t copy — select and copy the link", "error");
    }
  }

  return (
    <div className={`${styles.ready} ${styles.screenIn}`}>
      <div className={styles.readyIcon} aria-hidden>
        <FiCheck />
      </div>
      <h2 className={styles.readyHead}>
        Your link is <em>ready</em>
      </h2>
      <p className={styles.readySub}>
        It’s one-time and personal to whoever you send it, and it expires in 7
        days. Share it only with someone you’d vouch for.
      </p>

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
          aria-label={copied ? "Link copied" : "Copy invite link"}
        >
          {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className={styles.readyShare}>
        <span className={styles.readyShareLabel}>Or send it through</span>
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
        One-time link · {expiryLabel(invite.expiresAt)}
      </div>

      <Button
        variant="ghost-dark"
        to={routes.accountProfile}
        className={styles.readyDone}
      >
        Back to my profile
      </Button>
    </div>
  );
}
