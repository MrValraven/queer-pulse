import { useMemo } from "react";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AccessGroupSection } from "./StudioAccessibilityGroup";
import { StudioAccessibilityShowcase } from "./StudioAccessibilityShowcase";
import { StudioShortcutList } from "./player/ui/StudioShortcutList";
import { StudioShell } from "./StudioShell";
import { buildLiveGroups } from "./studioAccessibility.data";
import { useStudioShowcase } from "./useStudioShowcase";
import s from "./StudioAccessibilityPage.module.css";

/** What works today and the player's keyboard shortcuts in both modes; the
 *  co-op's statement, roadmap groups and audit line in the demo only (spec
 *  section 3.5, Listening spec 7.9). */
export function StudioAccessibilityPage() {
  const { t } = useTranslation();
  const isShowcase = useStudioShowcase();
  const groups = useMemo(() => buildLiveGroups(t), [t]);

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>{t("studio:accessibilityLive.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="studio:accessibilityLive.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={s.lede}>{t("studio:accessibilityLive.lede")}</p>
        </div>

        {groups.map((group, groupIndex) => (
          <AccessGroupSection key={groupIndex} group={group} />
        ))}

        <section className={s.sec}>
          <h2>
            <Translation
              i18nKey="studio:accessibility.shortcuts.title"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={s.dek}>{t("studio:accessibility.shortcuts.dek")}</div>
          <StudioShortcutList />
        </section>

        {isShowcase && <StudioAccessibilityShowcase />}

        <div className={s.contact}>
          <h2>
            <Translation
              i18nKey="studio:accessibilityLive.contact.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("studio:accessibilityLive.contact.body")}</p>
          <Button
            variant="primary"
            size="lg"
            to={`${routes.contact}?topic=accessibility`}
          >
            {t("studio:accessibilityLive.contact.cta")}
          </Button>
          {isShowcase && (
            <div className={s.meta}>
              {t("studio:accessibility.contact.meta")}
            </div>
          )}
        </div>
      </div>
    </StudioShell>
  );
}
