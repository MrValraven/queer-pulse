import { Link, NavLink } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  RAIL_MAIN,
  CONTRIBUTE,
  GOVERNANCE,
  UTILITY,
  LIBRARY,
  SUSTAINER_SINCE_DATE,
  YEARLY_GIVING,
  type RailLink,
} from "./studioShell.data";
import styles from "./studio.module.css";

function railClass({ isActive }: { isActive: boolean }) {
  return [styles.railItem, isActive && styles.railItemOn]
    .filter(Boolean)
    .join(" ");
}

function RailGroup({ items }: { items: RailLink[] }) {
  const { t } = useTranslation();
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          end={item.end}
          className={railClass}
        >
          <span className={styles.nm}>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </>
  );
}

export function StudioRail() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <aside className={styles.rail}>
      <div className={styles.brandRow}>
        <span className={styles.pulseDot} aria-hidden />
        <Link to={routes.homepage} className={styles.brand}>
          <Translation
            i18nKey="studio:brand.lockup"
            components={{ em: <em /> }}
          />
        </Link>
        <span className={styles.product}>{t("studio:brand.studioLabel")}</span>
      </div>

      <div className={styles.railGrp}>
        <RailGroup items={RAIL_MAIN} />
      </div>

      <div className={styles.railDivider} />

      <div className={styles.railGrp}>
        <h5>{t("studio:rail.section.contribute")}</h5>
        <RailGroup items={CONTRIBUTE} />
      </div>

      <div className={styles.railGrp}>
        <h5>{t("studio:rail.section.governance")}</h5>
        <RailGroup items={GOVERNANCE} />
      </div>

      <div className={styles.railGrp}>
        <h5>{t("studio:rail.section.coop")}</h5>
        <RailGroup items={UTILITY} />
      </div>

      <div className={styles.railDivider} />

      <div className={styles.railGrp}>
        <h5>{t("studio:rail.section.library")}</h5>
        {LIBRARY.map((pl) => (
          <Link key={pl.name} to={pl.to} className={styles.plItem}>
            <span className={styles.plCov}>
              <ImageSlot
                src={pl.image}
                tint={pl.tint}
                width={36}
                height={36}
                radius={5}
                placeholder=""
              />
            </span>
            <span>
              <span className={styles.plName} style={{ display: "block" }}>
                {pl.name}
                <em>{pl.em}</em>
              </span>
              <span className={styles.plMeta}>{pl.meta}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className={styles.railFoot}>
        <Translation
          i18nKey="studio:rail.foot.sustainedSince"
          components={{ em: <em /> }}
          values={{
            date: fmt.date(SUSTAINER_SINCE_DATE, {
              month: "long",
              year: "numeric",
            }),
          }}
        />
        <span className={styles.pay}>
          <Translation
            i18nKey="studio:rail.foot.paid"
            components={{ b: <b /> }}
            values={{
              amount: fmt.currency(YEARLY_GIVING.amount),
              count: YEARLY_GIVING.artistCount,
            }}
          />
        </span>
      </div>
    </aside>
  );
}
