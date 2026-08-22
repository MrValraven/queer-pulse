import { FiCheck, FiCopy, FiEye, FiShare2, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useClipboard } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { appOrigin } from "../../shared/lib/inviteUrl";
import type { Job } from "./jobs.data";
import styles from "./PostJobPage.module.css";

export function PostJobConfirmation({
  job,
  onPostAnother,
}: {
  job: Job;
  onPostAnother: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { copy, copied } = useClipboard();

  // Absolute so a pasted link opens the listing wherever this instance runs
  // (localhost in dev, the real domain in production).
  const listingUrl = `${appOrigin()}${routes.jobs}/${job.slug}`;

  // The success toast only fires once the write resolves. A denied permission,
  // an insecure origin and an embedded webview all land in the error branch,
  // where the copy points at a way to get the link by hand.
  async function copyListingLink() {
    const didCopy = await copy(listingUrl);
    showToast(
      didCopy
        ? t("economy:postJob.confirm.share.toastLink")
        : t("economy:postJob.confirm.share.toastLinkFailed"),
      didCopy ? "success" : "error",
    );
  }

  return (
    <div className={styles.confirm}>
      <div className={styles.confirmBadge} aria-hidden>
        <svg viewBox="0 0 36 36">
          <polyline points="10,19 16,25 27,12" />
        </svg>
      </div>
      <div className={styles.eyebrow} style={{ textAlign: "center" }}>
        {job.organization}
      </div>
      <h1 className={styles.confirmTitle}>
        <Translation
          i18nKey="economy:postJob.confirm.title"
          values={{ title: job.title }}
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.confirmSub}>{t("economy:postJob.confirm.sub")}</p>
      <div className={styles.confirmActions}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => void navigate(`${routes.jobs}/${job.slug}`)}
        >
          {t("economy:postJob.confirm.viewListing")}
        </Button>
        <Button variant="ghost" size="lg" onClick={onPostAnother}>
          {t("economy:postJob.confirm.postAnother")}
        </Button>
      </div>

      <div className={styles.cpanels}>
        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiEye size={15} />
            </span>
            <span className={styles.cpanelTitle}>
              {t("economy:postJob.confirm.performance.title")}
            </span>
          </div>
          <div className={styles.cpanelBody}>
            {t("economy:postJob.confirm.performance.body")}
          </div>
          <div className={styles.cstatRow}>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>
                {t("economy:postJob.confirm.performance.views")}
              </div>
            </div>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>
                {t("economy:postJob.confirm.performance.saves")}
              </div>
            </div>
            <div>
              <div className={styles.cstatN}>0</div>
              <div className={styles.cstatL}>
                {t("economy:postJob.confirm.performance.replies")}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiUsers size={15} />
            </span>
            <span className={styles.cpanelTitle}>
              {t("economy:postJob.confirm.responses.title")}
            </span>
          </div>
          <div className={styles.cpanelBody}>
            {t("economy:postJob.confirm.responses.body")}
          </div>
          <div style={{ marginTop: 14 }}>
            <Button
              variant="ghost"
              size="md"
              onClick={() => void navigate(routes.applicationStatus)}
            >
              {t("economy:postJob.confirm.responses.openManager")}
            </Button>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiShare2 size={15} />
            </span>
            <span className={styles.cpanelTitle}>
              {t("economy:postJob.confirm.share.title")}
            </span>
          </div>
          <div className={styles.cpanelBody}>
            {t("economy:postJob.confirm.share.body")}
          </div>
          {/* "Post to Feed" used to sit here and only fired a success toast.
              The feed API exposes likes and replies alone, with no create-post
              endpoint, so the button is gone until there is one. */}
          <div className={styles.shareRow}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void copyListingLink()}
            >
              {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
              {copied
                ? t("economy:postJob.confirm.share.linkCopied")
                : t("economy:postJob.confirm.share.copyLink")}
            </Button>
          </div>
        </div>

        <div className={styles.cpanel}>
          <div className={styles.cpanelH}>
            <span className={styles.cpanelIc} aria-hidden>
              <FiCheck size={15} />
            </span>
            <span className={styles.cpanelTitle}>
              {t("economy:postJob.confirm.whatsNext.title")}
            </span>
          </div>
          <div className={styles.cpanelBody}>
            {t("economy:postJob.confirm.whatsNext.body")}
          </div>
        </div>
      </div>
    </div>
  );
}
