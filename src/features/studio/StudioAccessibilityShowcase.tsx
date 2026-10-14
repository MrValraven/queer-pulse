import { useMemo } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AccessGroupSection } from "./StudioAccessibilityGroup";
import { buildGroups } from "./studioAccessibility.data";
import s from "./StudioAccessibilityPage.module.css";

/** Demo only: the statement and the original groups, under their original keys. */
export function StudioAccessibilityShowcase() {
  const { t } = useTranslation();
  const groups = useMemo(() => buildGroups(t), [t]);
  return (
    <>
      <div className={s.statement}>
        <p>
          <Translation
            i18nKey="studio:accessibility.statement.p1"
            components={{ em: <em /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="studio:accessibility.statement.p2"
            components={{ em: <em /> }}
          />
        </p>
      </div>

      {groups.map((group, groupIndex) => (
        <AccessGroupSection key={groupIndex} group={group} />
      ))}
    </>
  );
}
