import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { StudioRightsShowcase } from "./StudioRightsShowcase";
import { StudioShell } from "./StudioShell";
import { RIGHTS_LIVE_SECTIONS } from "./studioRights.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioRightsPage.module.css";

/** How rights, reports, takedowns and disputes work, in both modes; the
 *  co-op's mock release table in the demo only (spec section 3.6). */
export function StudioRightsPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const releasesHref = useStudioAccess().uploadablePersonas[0]?.href;

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.pageH}>
          <div className={s.eb}>{t("studio:rightsLive.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:rightsLive.title"
              components={{ em: <em /> }}
            />
          </h1>
          <div className={s.dek}>{t("studio:rightsLive.dek")}</div>
        </div>

        <div className={s.liveSections}>
          {RIGHTS_LIVE_SECTIONS.map((section) => (
            <section key={section.id} className={s.liveSec}>
              <h2>
                <Translation
                  i18nKey={section.headingKey}
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t(section.bodyKey)}</p>
            </section>
          ))}
        </div>

        {releasesHref && (
          <div className={s.liveCta}>
            <Button variant="primary" size="lg" to={releasesHref}>
              {t("studio:rightsLive.cta")}
            </Button>
          </div>
        )}

        {isShowcase && <StudioRightsShowcase />}
      </div>
    </StudioShell>
  );
}
