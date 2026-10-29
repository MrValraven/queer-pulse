import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta } from "../../shared/seo/PageMeta";
import { StudioPurchaseList } from "../studio/StudioPurchaseList";
import css from "./MusicPurchasesPage.module.css";

/** "Your music purchases": every purchase of the member, newest first, with
 *  the downloads of the confirmed ones and the reason on a declined or
 *  lapsed one (the notifications for those open here). It sits under the member gate and outside the Studio gate, so a
 *  member whose Studio access was removed still finds and downloads what they
 *  bought. */
export function MusicPurchasesPage() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <PageMeta
        title={`${t("studio:purchase.account.pageTitle")} · QueerPulse`}
        noIndex
      />
      <div className={css.page}>
        <header className={css.head}>
          <Link to={`${routes.settings}?pane=account`} className={css.eyebrow}>
            {t("studio:purchase.account.eyebrow")}
          </Link>
          <h1 className={css.title}>
            <Translation
              i18nKey="studio:purchase.account.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={css.dek}>{t("studio:purchase.account.dek")}</p>
        </header>
        <StudioPurchaseList
          status="all"
          isStudioContext={false}
          headingLevel={2}
        />
      </div>
    </PageShell>
  );
}
