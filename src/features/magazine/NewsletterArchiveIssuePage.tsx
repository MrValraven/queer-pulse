import { useParams } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import { NewsletterIssueBody } from "./NewsletterIssueBody";
import { getIssue } from "./newsletterArchiveIssue.data";
import styles from "./NewsletterArchiveIssuePage.module.css";

export function NewsletterArchiveIssuePage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const issue = getIssue(slug);

  return (
    <PageShell>
      <MagazineMasthead active="newsletter" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Button
            variant="ghost"
            size="md"
            to={routes.newsletterArchive}
            className={styles.back}
          >
            <FiArrowLeft aria-hidden />{" "}
            {t("magazine:newsletterArchive.issue.backToArchive")}
          </Button>

          <header className={styles.head}>
            <div className={styles.tag}>
              <FiMail aria-hidden /> {issue.streamLabel}
            </div>
            <div className={styles.issueLine}>
              №<em>{issue.issueNo}</em> · sent {issue.date}
            </div>
            <h1 className={styles.h1}>{issue.subject}</h1>
            <p className={styles.standfirst}>{issue.standfirst}</p>
            <div className={styles.meta}>
              <span>
                <b>{issue.recipients}</b>
              </span>
              <span>
                <b>{issue.readTime}</b>
              </span>
              <span>
                <b>{issue.openRate}</b>
              </span>
            </div>
          </header>

          <NewsletterIssueBody sections={issue.sections} />

          <footer className={styles.signoff}>
            <div className={styles.signoffInner}>
              <div className={styles.signoffFrom}>
                {issue.signoff.from}
                <span>{issue.signoff.role}</span>
              </div>
              <p className={styles.signoffNote}>{issue.signoff.note}</p>
              <div className={styles.signoffActions}>
                <Button variant="ghost-dark" to={routes.newsletterArchive}>
                  {t("magazine:newsletterArchive.issue.browseFullArchive")}
                </Button>
                <Button variant="ghost-dark" to={routes.newsletter}>
                  {t("magazine:newsletterArchive.issue.subscribeToThis")}
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </PageShell>
  );
}
