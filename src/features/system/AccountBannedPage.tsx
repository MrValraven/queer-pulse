import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./AccountBannedPage.module.css";

export function AccountBannedPage() {
  const { t } = useTranslation();

  return (
    <SystemStateShell orbTone="plum" mutedBrand>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <div className={styles.kicker}>{t("system:accountBanned.kicker")}</div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:accountBanned.heading"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:accountBanned.lead1"
            components={{ em: <em /> }}
          />
        </p>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:accountBanned.lead2"
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.violation}>
          <h4>{t("system:accountBanned.violation.title")}</h4>
          <p>
            <Translation
              i18nKey="system:accountBanned.violation.body"
              components={{ b: <b /> }}
            />
          </p>
        </div>

        <div className={styles.whatNow}>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>1</div>
            <div className={styles.whatText}>
              <b>{t("system:accountBanned.whatNow.row1.title")}</b>
              <span>{t("system:accountBanned.whatNow.row1.body")}</span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>2</div>
            <div className={styles.whatText}>
              <b>{t("system:accountBanned.whatNow.row2.title")}</b>
              <span>
                <Translation
                  i18nKey="system:accountBanned.whatNow.row2.body"
                  components={{ a: <Link to={routes.privacy} /> }}
                />
              </span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>3</div>
            <div className={styles.whatText}>
              <b>{t("system:accountBanned.whatNow.row3.title")}</b>
              <span>{t("system:accountBanned.whatNow.row3.body")}</span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>4</div>
            <div className={styles.whatText}>
              <b>{t("system:accountBanned.whatNow.row4.title")}</b>
              <span>
                <Translation
                  i18nKey="system:accountBanned.whatNow.row4.body"
                  components={{
                    crisisLink: <Link to={routes.emergency} />,
                    wellbeingLink: <Link to={routes.wellbeing} />,
                  }}
                />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={routes.report}>
            {t("system:accountBanned.actions.appealCta")}
          </Button>
          <Button variant="ghost" to={routes.dataExport}>
            {t("system:accountBanned.actions.eraseCta")}
          </Button>
        </div>
        <p className={styles.foot}>
          <Translation
            i18nKey="system:accountBanned.foot"
            components={{ a: <Link to={routes.codeOfConduct} /> }}
          />
        </p>
      </div>
    </SystemStateShell>
  );
}
