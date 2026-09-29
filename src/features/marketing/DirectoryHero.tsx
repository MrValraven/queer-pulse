import { FiPlus } from "react-icons/fi";
import { PageHero } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import s from "./DirectoryPage.module.css";

/** The directory's page hero: compact, since this page is a search box and a
 *  result list, and the full display hero pushed the first places below the
 *  fold. Its foot carries the "list your business" CTA and the live note. */
export function DirectoryHero() {
  const { t } = useTranslation();
  return (
    <PageHero
      compact
      eyebrow={t("marketing:directory.hero.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:directory.hero.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("marketing:directory.hero.sub")}
    >
      {/* The listing wizard was only reachable from the strip under every
          result. Ghost-dark keeps it quieter than the search it sits above,
          since most visitors come here to find a place. */}
      <div className={s.heroFoot}>
        <Button variant="ghost-dark" to={routes.listBusiness}>
          <FiPlus aria-hidden /> {t("marketing:directory.hero.cta")}
        </Button>
        <div className={s.heroNote}>
          <span className={s.live} /> {t("marketing:directory.hero.note")}
        </div>
      </div>
    </PageHero>
  );
}
