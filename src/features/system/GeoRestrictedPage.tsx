import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { StatusCard } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GeoRestrictedPage.module.css";

const CAN_DO = [
  {
    labelKey: "system:geoRestricted.can.readArticles.label",
    detailKey: "system:geoRestricted.can.readArticles.detail",
    to: routes.magazine,
  },
  {
    labelKey: "system:geoRestricted.can.resources.label",
    detailKey: "system:geoRestricted.can.resources.detail",
    to: routes.resources,
  },
  {
    labelKey: "system:geoRestricted.can.askUs.label",
    detailKey: "system:geoRestricted.can.askUs.detail",
    to: routes.contact + "?topic=region",
  },
];

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function GeoRestrictedPage() {
  const { t } = useTranslation();

  return (
    <SystemStateShell>
      <StatusCard
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <path d="M12 3a14 14 0 0 1 4 9 14 14 0 0 1-4 9 14 14 0 0 1-4-9 14 14 0 0 1 4-9z" />
          </svg>
        }
        kicker={t("system:geoRestricted.eyebrow")}
        heading={
          <Translation
            i18nKey="system:geoRestricted.h1"
            components={{ em: <em /> }}
          />
        }
        lead={
          <Translation
            i18nKey="system:geoRestricted.lead"
            components={{ em: <em /> }}
          />
        }
      >
        <div className={styles.why}>
          <h4>{t("system:geoRestricted.why.title")}</h4>
          <p>
            <Translation
              i18nKey="system:geoRestricted.why.body"
              components={{ em: <em /> }}
            />
          </p>
        </div>

        <div className={styles.can}>
          <h3 className={styles.canTitle}>
            {t("system:geoRestricted.can.title")}
          </h3>
          <div className={styles.canList}>
            {CAN_DO.map((item) => (
              <div key={item.labelKey} className={styles.canRow}>
                <div className={styles.canIc}>
                  <CheckIcon />
                </div>
                <div>
                  <b>{t(item.labelKey)}</b>
                  <span>
                    <Translation
                      i18nKey={item.detailKey}
                      components={{ a: <Link to={item.to} /> }}
                    />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.detect}>
          <div className={styles.flag} aria-hidden />
          <span>
            <Translation
              i18nKey="system:geoRestricted.detect"
              components={{ b: <b /> }}
            />
          </span>
          <Link to={routes.homepage}>
            {t("system:geoRestricted.goHome")} <FiArrowRight aria-hidden />
          </Link>
        </div>
      </StatusCard>
    </SystemStateShell>
  );
}
