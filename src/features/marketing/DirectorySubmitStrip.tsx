import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./DirectoryPage.module.css";

/** The directory's closing strip: "list your business" CTA. No "Request an
 *  invite" outro, since `/local/directory` is behind the auth gate and
 *  everyone who reaches this page is already a member. */
export function DirectorySubmitStrip() {
  const { t } = useTranslation();
  return (
    <section className={s.content}>
      <div className="wrap">
        <Reveal className={s.submitStrip}>
          <div>
            <h3>
              <Translation
                i18nKey="marketing:directory.submitStrip.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("marketing:directory.submitStrip.body")}</p>
          </div>
          <Button size="lg" to={routes.listBusiness}>
            {t("marketing:directory.submitStrip.cta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
