import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import {
  PRACTITIONERS,
  FILTERS,
  TINT_BG,
  TINT_FG,
  initials,
  type Cat,
  type Practitioner,
} from "./solidarity.data";
import { SolidaritySkeleton } from "./SolidaritySkeleton";
import styles from "./SolidarityPage.module.css";

/**
 * A practitioner card's contact affordance. Extracted so `useMemberContact` runs
 * at a component top level rather than inside the `items.map` below, where a hook
 * call would be illegal.
 */
function PractitionerContactButton({
  practitioner,
}: {
  practitioner: Practitioner;
}) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(practitioner.id);
  return (
    <button
      type="button"
      className={styles.pcContact}
      onClick={() =>
        contact({ slug: practitioner.id, name: practitioner.name })
      }
    >
      {connected
        ? t("connect:contact.message")
        : t("economy:solidarityDirectory.contactCta")}
    </button>
  );
}

export function SolidarityDirectory() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const loading = useSimulatedLoad();
  const [cat, setCat] = useState<Cat | "all">("all");
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();

  const items = PRACTITIONERS.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    if (q) {
      const hay =
        `${p.name}${p.spec}${p.hood}${p.tags.join(" ")}${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      {demoMode && (
        <div className={styles.filterBar}>
          <div className={styles.fbInner}>
            <span className={styles.fbLabel}>
              {t("economy:solidarityDirectory.professionLabel")}
            </span>
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={[styles.chip, cat === filter.id && styles.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setCat(filter.id)}
              >
                {t(filter.labelKey)}
              </button>
            ))}
            <div className={styles.fbSep} />
            <div className={styles.cbSearch}>
              <input
                type="text"
                aria-label={t("economy:solidarityDirectory.searchPlaceholder")}
                placeholder={t("economy:solidarityDirectory.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className={styles.count}>
              <Translation
                i18nKey="economy:solidarityDirectory.count"
                components={{ b: <b /> }}
                values={{ count: items.length }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            {!demoMode ? (
              <EmptyState
                icon={<FiHeart />}
                title={t("economy:solidarityDirectory.emptyLive.title")}
                description={t(
                  "economy:solidarityDirectory.emptyLive.description",
                )}
              />
            ) : (
              <>
                {loading &&
                  Array.from({ length: 6 }).map((_, skeletonIndex) => (
                    <SolidaritySkeleton key={skeletonIndex} />
                  ))}
                {!loading && items.length === 0 && (
                  <EmptyState
                    icon={<FiHeart />}
                    title={t("economy:solidarityDirectory.empty.title")}
                    description={t(
                      "economy:solidarityDirectory.empty.description",
                    )}
                    action={{
                      label: t(
                        "economy:solidarityDirectory.empty.clearFilters",
                      ),
                      onClick: () => {
                        setCat("all");
                        setQuery("");
                      },
                    }}
                  />
                )}
                {!loading &&
                  items.map((practitioner, practitionerIndex) => (
                    <FadeIn
                      key={practitioner.id}
                      delay={Math.min(practitionerIndex, 8) * 60}
                      as="article"
                      className={styles.pc}
                    >
                      <div className={styles.pcTop}>
                        <div
                          className={styles.pcAv}
                          style={{
                            background: TINT_BG[practitioner.tint],
                            color: TINT_FG[practitioner.tint],
                          }}
                        >
                          {initials(practitioner.name)}
                        </div>
                        <div className={styles.pcMeta}>
                          <div className={styles.pcName}>
                            {practitioner.name}
                          </div>
                          <div className={styles.pcSpec}>
                            {practitioner.spec} · {practitioner.hood}
                          </div>
                        </div>
                        <span
                          className={[
                            styles.pcBadge,
                            practitioner.isMember
                              ? styles.badgeMember
                              : styles.badgeVerified,
                          ].join(" ")}
                        >
                          {practitioner.isMember
                            ? t("economy:solidarityDirectory.badgeMember")
                            : t("economy:solidarityDirectory.badgeVerified")}
                        </span>
                      </div>
                      <div className={styles.pcPricing}>
                        <div className={styles.pcPriceLabel}>
                          {t("economy:solidarityDirectory.slidingScaleLabel")}
                        </div>
                        <div className={styles.pcPriceRange}>
                          {practitioner.range}
                        </div>
                        <div className={styles.pcPriceNote}>
                          {practitioner.scaleNote}
                        </div>
                      </div>
                      <div className={styles.pcDesc}>{practitioner.description}</div>
                      <div className={styles.pcTags}>
                        {practitioner.tags.map((tag) => (
                          <span key={tag} className={styles.ptag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className={styles.pcFoot}>
                        <span className={styles.pcLang}>
                          {practitioner.langs.join(" · ")}
                        </span>
                        <PractitionerContactButton
                          practitioner={practitioner}
                        />
                      </div>
                    </FadeIn>
                  ))}
              </>
            )}
          </div>

          <div className={styles.regStrip}>
            <div className={styles.rsText}>
              <h3>
                {t("economy:solidarityDirectory.register.titleLine1")}
                <br />
                <em>{t("economy:solidarityDirectory.register.titleEm")}</em>
              </h3>
              <p>{t("economy:solidarityDirectory.register.body")}</p>
            </div>
            <div className={styles.rsCta}>
              <Button to={routes.requestInvite} variant="primary" size="lg">
                {t("economy:solidarityDirectory.register.cta")}
              </Button>
              <Link to={routes.contact} className={styles.rsCtaLink}>
                {t("economy:solidarityDirectory.register.questionsLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
