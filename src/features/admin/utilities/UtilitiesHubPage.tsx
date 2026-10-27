import { FadeIn } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { AdminPageHeader } from "../ui";
import { UtilityToolCard } from "./UtilityToolCard";
import { UTILITY_TOOLS } from "./utilityTools.data";
import styles from "./UtilitiesHubPage.module.css";

/** The staff Utilities hub: one card per browser-only tool. */
export function UtilitiesHubPage() {
  const { t } = useTranslation();
  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:utilities.hub.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:utilities.hub.eyebrow")}
          title={
            <Translation
              i18nKey="admin:utilities.hub.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:utilities.hub.sub")}
        />
      </FadeIn>
      <FadeIn delay={100}>
        <ul
          className={styles.grid}
          aria-label={t("admin:utilities.hub.listLabel")}
        >
          {UTILITY_TOOLS.map((tool) => (
            <li key={tool.id} className={styles.item}>
              <UtilityToolCard tool={tool} />
            </li>
          ))}
        </ul>
      </FadeIn>
    </AdminShell>
  );
}
