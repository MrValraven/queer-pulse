import { useMemo } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { StudioShell } from "./StudioShell";
import { buildGroups, buildShortcuts, type ItemStatus } from "./studioAccessibility.data";
import s from "./StudioAccessibilityPage.module.css";

function StatusPill({ status }: { status: ItemStatus }) {
  const { t } = useTranslation();
  if (status === "soon") {
    return (
      <span className={`${s.st} ${s.soon}`}>
        <FiClock />
        {t("studio:accessibility.status.inProgress")}
      </span>
    );
  }
  return (
    <span className={`${s.st} ${s.live}`}>
      <FiCheckCircle />
      {t("studio:accessibility.status.live")}
    </span>
  );
}

export function StudioAccessibilityPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const groups = useMemo(() => buildGroups(t), [t]);
  const shortcuts = useMemo(() => buildShortcuts(t), [t]);

  return (
    <StudioShell>
      <div className={s.wrap}>
        <div className={s.hero}>
          <div className={s.eb}>{t("studio:accessibility.hero.eyebrow")}</div>
          <h1>
            <Translation i18nKey="studio:accessibility.hero.title" components={{ em: <em /> }} />
          </h1>
          <p className={s.lede}>
            <Translation i18nKey="studio:accessibility.hero.lede" components={{ em: <em /> }} />
          </p>
        </div>

        <div className={s.statement}>
          <p>
            <Translation i18nKey="studio:accessibility.statement.p1" components={{ em: <em /> }} />
          </p>
          <p>
            <Translation i18nKey="studio:accessibility.statement.p2" components={{ em: <em /> }} />
          </p>
        </div>

        {groups.map((group, groupIndex) => (
          <section key={groupIndex} className={s.sec}>
            <h2>{group.heading}</h2>
            <div className={s.dek}>{group.dek}</div>
            <div className={s.list}>
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className={s.item}>
                  <div className={s.ic}>{item.icon}</div>
                  <div className={s.ai}>
                    <h4>{item.heading}</h4>
                    <p>{item.body}</p>
                  </div>
                  <StatusPill status={item.status} />
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className={s.sec}>
          <h2>
            <Translation i18nKey="studio:accessibility.shortcuts.title" components={{ em: <em /> }} />
          </h2>
          <div className={s.dek}>{t("studio:accessibility.shortcuts.dek")}</div>
          <div className={s.kbdTable}>
            {shortcuts.map((row, rowIndex) => (
              <div key={rowIndex} className={s.kbdRow}>
                <span className={s.desc}>{row.heading}</span>
                <div className={s.keys}>
                  {row.keys.map((k) => (
                    <span key={k} className={s.kbd}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={s.contact}>
          <h3>
            <Translation i18nKey="studio:accessibility.contact.title" components={{ em: <em /> }} />
          </h3>
          <p>
            <Translation i18nKey="studio:accessibility.contact.body" components={{ em: <em /> }} />
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              showToast(t("studio:accessibility.contact.reportToast"), "success")
            }
          >
            {t("studio:accessibility.contact.reportCta")}
          </Button>
          <div className={s.meta}>{t("studio:accessibility.contact.meta")}</div>
        </div>
      </div>
    </StudioShell>
  );
}
