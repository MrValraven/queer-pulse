import { useState } from "react";
import { Link } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { ImageSlot, FadeIn, EmptyState } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { StudioShell } from "./StudioShell";
import { StudioCardGridSkeleton } from "./StudioSkeletons";
import { LIBRARY, TABS } from "./studioLibrary.data";
import ss from "./studio.module.css";
import s from "./studioPages.module.css";

/** Mock lifetime paid-to-artists total for this signed-in listener — a
 * demo number, not authored copy; kept as data, formatted via useFormat(). */
const LIFETIME_PAID_AMOUNT = 312;
const LIFETIME_ARTIST_COUNT = 47;

export function StudioLibraryPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("Albums");
  const activeTab = TABS.find((option) => option.id === tab) ?? TABS[0];
  const items = LIBRARY[tab] ?? [];
  const loading = useSimulatedLoad();

  return (
    <StudioShell>
      <div className={s.pageH}>
        <div className={s.eb}>{t("studio:library.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:library.title"
            components={{ em: <em /> }}
          />
        </h1>
        <div className={s.dek}>
          <Translation
            i18nKey="studio:library.dek"
            components={{ em: <em /> }}
            values={{
              amount: fmt.currency(LIFETIME_PAID_AMOUNT),
              artistCount: LIFETIME_ARTIST_COUNT,
            }}
          />
        </div>
      </div>

      <div className={s.tabs}>
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`${s.tab} ${tab === option.id ? s.tabOn : ""}`}
            onClick={() => setTab(option.id)}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <section className={ss.row}>
        {loading ? (
          <StudioCardGridSkeleton className={ss.rowGrid} count={8} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FiBookmark />}
            title={t("studio:library.empty.title")}
            description={
              <Translation
                i18nKey="studio:library.empty.description"
                components={{ em: <em /> }}
                values={{ category: t(activeTab.categoryKey) }}
              />
            }
            action={{
              label: t("studio:library.empty.browseCta"),
              to: routes.studio,
            }}
            secondaryAction={{
              label: t("studio:library.empty.searchCta"),
              to: routes.studioSearch,
            }}
          />
        ) : (
          <div className={ss.rowGrid}>
            {items.map((item, itemIndex) => (
              <FadeIn
                key={item.pre + item.meta}
                delay={Math.min(itemIndex, 8) * 60}
                as={Link}
                to={item.to}
                className={ss.card}
              >
                <div className={ss.cardCov}>
                  <ImageSlot
                    src={item.image}
                    tint={item.tint}
                    width="100%"
                    height="100%"
                    radius={10}
                    placeholder={t("studio:media.coverLabel")}
                    style={{ position: "absolute", inset: 0 }}
                  />
                </div>
                <h4>
                  {item.pre}
                  {item.em && <em>{item.em}</em>}
                  {item.post}
                </h4>
                <div className={ss.meta}>{item.meta}</div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>
    </StudioShell>
  );
}
