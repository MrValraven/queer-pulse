import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FiHeart } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FeatureHelp,
  Outro,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useWorkshops } from "../../app/providers/useWorkshops";
import { SKILLS, SKILL_FILTERS } from "./skills.data";
import { SkillSkeleton } from "./SkillCard";
import { SkillsSection } from "./SkillsSection";
import { WorkshopsSection } from "./WorkshopsSection";
import { AddWorkshopModal } from "./AddWorkshopModal";
import styles from "./SkillsPage.module.css";

export function SkillsPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { workshops, isLoading: workshopsLoading } = useWorkshops();
  const simulatedLoad = useSimulatedLoad();
  // Demo keeps the prototype's timed skeleton; live waits on the real first page
  // of GET /workshops so the board never flashes "nothing here yet" mid-fetch.
  const loading = demoMode ? simulatedLoad : workshopsLoading;
  const [active, setActive] = useState("all");
  const [listingWorkshop, setListingWorkshop] = useState(false);

  // The skills board has no live backend yet, so members' offers and asks only
  // exist in demo mode ("Populate platform"). Live mode shows an empty board
  // rather than mock members' skills. Workshops are gated in WorkshopsProvider.
  const source = useMemo(() => (demoMode ? SKILLS : []), [demoMode]);
  const filtered = useMemo(
    () =>
      active === "all"
        ? source
        : source.filter((skill) => skill.category === active),
    [source, active],
  );
  const offering = filtered.filter((skill) => skill.type === "offering");
  const looking = filtered.filter((skill) => skill.type === "looking");

  // Nothing has been shared yet at all — the filters have nothing to act on, so
  // hide them and let one empty state carry the calls to action.
  const boardEmpty = source.length === 0 && workshops.length === 0;

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>{t("economy:skills.hero.eyebrow")}</div>
          <h1>
            <Translation
              i18nKey="economy:skills.hero.title"
              components={{ em: <em /> }}
            />{" "}
            <FeatureHelp id="economy.skills" />
          </h1>
          <p>{t("economy:skills.hero.lead")}</p>
        </div>
      </header>

      {!boardEmpty && (
        <div className={styles.filterBar}>
          <div className="wrap">
            <div className={styles.filterInner}>
              <span className={styles.filterLabel}>
                {t("economy:skills.filter.browseBy")}
              </span>
              {SKILL_FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter.value}
                  className={[
                    styles.pill,
                    active === filter.value && styles.pillOn,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActive(filter.value)}
                >
                  {t(filter.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className="wrap">
          {!boardEmpty && (
            <p className={styles.intro}>{t("economy:skills.intro")}</p>
          )}

          {loading ? (
            <div className={styles.section}>
              <div className={styles.cards}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkillSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : boardEmpty ? (
            <EmptyState
              className={styles.empty}
              icon={<FiHeart />}
              title={t("economy:skills.empty.title")}
              description={t("economy:skills.empty.description")}
              action={{
                label: t("economy:skills.empty.listWorkshopCta"),
                onClick: () => setListingWorkshop(true),
              }}
              secondaryAction={{
                label: t("economy:skills.empty.postBoardCta"),
                href: "/#board",
              }}
            />
          ) : (
            <>
              {workshops.length > 0 && (
                <div className={styles.section}>
                  <WorkshopsSection active={active} />
                </div>
              )}

              {(offering.length > 0 ||
                (source.length > 0 && active !== "all")) && (
                <SkillsSection
                  title={
                    <Translation
                      i18nKey="economy:skills.section.offeringTitle"
                      components={{ em: <em /> }}
                    />
                  }
                  dotColor="var(--jade)"
                  skills={offering}
                  emptyDescription={t("economy:skills.section.offeringEmpty")}
                  onClearFilters={() => setActive("all")}
                />
              )}

              {(looking.length > 0 ||
                (source.length > 0 && active !== "all")) && (
                <SkillsSection
                  title={
                    <Translation
                      i18nKey="economy:skills.section.lookingTitle"
                      components={{ em: <em /> }}
                    />
                  }
                  dotColor="var(--accent)"
                  skills={looking}
                  emptyDescription={t("economy:skills.section.lookingEmpty")}
                  onClearFilters={() => setActive("all")}
                />
              )}
            </>
          )}

          <div className={styles.offerStrip}>
            <div>
              <h3>
                <Translation
                  i18nKey="economy:skills.offerStrip.title"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("economy:skills.offerStrip.body")}</p>
            </div>
            <Button href="/#board" size="lg">
              {t("economy:skills.offerStrip.cta")}
            </Button>
          </div>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="economy:skills.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("economy:skills.outro.sub")}
      >
        <Button to={requestInvitePath("skills")} variant="primary" size="lg">
          {t("economy:skills.outro.cta")}
        </Button>
      </Outro>

      {listingWorkshop && (
        <AddWorkshopModal onClose={() => setListingWorkshop(false)} />
      )}
    </PageShell>
  );
}
