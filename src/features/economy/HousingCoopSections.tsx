import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useHousingCoops } from "./api/useHousingCoops";
import { CoopEmptyState } from "./CoopEmptyState";
import {
  COOP_STATS,
  COOP_PHASES,
  COOP_TEMPLATES,
  COOP_RESOURCES,
  type FormingCoop,
} from "./housingCoop.data";
import styles from "./HousingCoopPage.module.css";

const FACE_TINT: Record<string, string | undefined> = {
  coral: styles.avCoral,
  jade: styles.avJade,
  plum: styles.avPlum,
};

/** Hero: headline + live formation stats card. */
export function CoopHero() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <section className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.housing}
          label={t("economy:housingCoop.backLabel")}
          tone="light"
        />
        <div className={styles.heroInner}>
          <div>
            <Reveal as="div" className={styles.eyebrow}>
              {t("economy:housingCoop.hero.eyebrow")}
            </Reveal>
            <Reveal as="h1" className={styles.title} delay={60}>
              <Translation
                i18nKey="economy:housingCoop.hero.title"
                components={{ em: <em /> }}
              />
            </Reveal>
            <Reveal as="p" className={styles.sub} delay={120}>
              <Translation
                i18nKey="economy:housingCoop.hero.sub"
                components={{ em: <em /> }}
              />
            </Reveal>
          </div>
          {/* The formation stats are demo-only fiction — live mode has no
              aggregate to show yet, so the stat card is hidden (the grid below
              is separately wired to live data). */}
          {demoMode && (
            <Reveal className={styles.statsCard} delay={160}>
              <div className={styles.statsHead}>
                {t("economy:housingCoop.hero.statsHead")}
              </div>
              {COOP_STATS.map((coopStat) => (
                <div className={styles.statRow} key={coopStat.labelKey}>
                  <span className="k">{t(coopStat.labelKey)}</span>
                  <span className="v">
                    {coopStat.value}
                    {coopStat.valueKey && t(coopStat.valueKey)}
                    {coopStat.em && <em>{coopStat.em}</em>}
                  </span>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/** The five-phase formation timeline. */
export function CoopPhases() {
  const { t } = useTranslation();
  return (
    <section className={styles.phases}>
      <div className="wrap">
        <Reveal className={styles.sectionHead}>
          <h2>
            <Translation
              i18nKey="economy:housingCoop.phases.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("economy:housingCoop.phases.sub")}</p>
        </Reveal>
        <div className={styles.phaseRail}>
          {COOP_PHASES.map((p, i) => (
            <Reveal className={styles.phase} key={p.number} delay={i * 60}>
              <div className={styles.phaseNum}>{p.number}</div>
              <div className={styles.phaseName}>
                {t(p.nameKey)} <em>{t(p.nameEmKey)}</em>
              </div>
              <div className={styles.phaseTime}>{t(p.timeKey)}</div>
              <div className={styles.phaseDesc}>{t(p.descKey)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** One co-op card in the "forming now" grid. */
function CoopCard({
  coop,
  onCta,
}: {
  coop: FormingCoop;
  onCta: (coop: FormingCoop) => void;
}) {
  return (
    <div className={styles.coopCard}>
      <div className={styles.ccHead}>
        <div>
          <div className={styles.ccTitle}>
            {coop.name} {coop.nameEm && <em>{coop.nameEm}</em>}
          </div>
          <div className={styles.ccLoc}>{coop.location}</div>
        </div>
        <span className={styles.ccPhase}>{coop.phaseLabel}</span>
      </div>
      <div className={styles.ccBody}>
        <div className={styles.ccProgress}>
          <div className={styles.ccBar}>
            <div
              className={`${styles.ccSeg} ${coop.operational ? styles.ccSegDone : ""}`}
              style={{ width: `${coop.progress}%` }}
            />
          </div>
          <div
            className={`${styles.ccStepLabel} ${coop.operational ? styles.ccStepLabelDone : ""}`}
          >
            {coop.operational ? (
              <>
                {coop.progressLabel} <em>{coop.progressEm}</em>
              </>
            ) : (
              <>
                <em>{coop.progressLabel}</em> through
              </>
            )}
          </div>
        </div>
        <div className={styles.ccDesc}>{coop.description}</div>
        <div className={styles.ccMeta}>
          {coop.meta.map((m, i) => (
            <span key={m.label}>
              {i > 0 && <span aria-hidden>· </span>}
              {m.label} <em>{m.value}</em>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.ccFoot}>
        {coop.faces.length > 0 ? (
          <div className={styles.avStack} aria-hidden>
            {coop.faces.map((f, i) => (
              <div className={`${styles.av} ${FACE_TINT[f.tint]}`} key={i}>
                {f.initials}
              </div>
            ))}
          </div>
        ) : (
          <span className={styles.ccCountChip}>
            {coop.location.split("·")[1]?.trim() ?? coop.location}
          </span>
        )}
        <Button
          variant={coop.cta.kind === "join" ? "primary" : "ghost"}
          onClick={() => onCta(coop)}
        >
          {coop.cta.label}
        </Button>
      </div>
    </div>
  );
}

/** The grid of co-ops currently forming or operational, wired to live data
 *  in live mode (demo mode still renders the `FORMING_COOPS` fixture). */
export function CoopGrid({
  onCta,
  onSeeAll,
  onStart,
}: {
  onCta: (coop: FormingCoop) => void;
  onSeeAll: () => void;
  onStart: () => void;
}) {
  const { t } = useTranslation();
  const { data: coops = [], isLoading } = useHousingCoops();
  return (
    <section className={styles.active}>
      <div className="wrap">
        <div className={styles.actHead}>
          <h2>
            <Translation
              i18nKey="economy:housingCoop.grid.title"
              components={{ em: <em /> }}
            />
          </h2>
          {coops.length > 0 && (
            <button type="button" className={styles.all} onClick={onSeeAll}>
              {t("economy:housingCoop.grid.seeAll")}{" "}
              <FiArrowRight aria-hidden />
            </button>
          )}
        </div>
        {isLoading ? (
          <div className={styles.coopGrid} aria-busy="true">
            {[0, 1, 2].map((slot) => (
              <div key={slot} className={styles.coopCardSkeleton} />
            ))}
          </div>
        ) : coops.length === 0 ? (
          <CoopEmptyState onStart={onStart} />
        ) : (
          <div className={styles.coopGrid}>
            {coops.map((coop) => (
              <CoopCard key={coop.id} coop={coop} onCta={onCta} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Formation templates — each card links to its full in-app document. */
export function CoopTemplates() {
  const { t } = useTranslation();
  return (
    <section className={styles.templates}>
      <div className="wrap">
        <div className={styles.sectionHead}>
          <h2>
            <Translation
              i18nKey="economy:housingCoop.templates.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("economy:housingCoop.templates.sub")}</p>
        </div>
        <div className={styles.tpGrid}>
          {COOP_TEMPLATES.map((template) => (
            <Link
              className={styles.tpCard}
              key={template.slug}
              to={`${routes.housingCoop}/templates/${template.slug}`}
            >
              <div className={styles.tpTag}>{t(template.tagKey)}</div>
              <div className={styles.tpName}>
                {t(template.nameKey)} <em>{t(template.nameEmKey)}</em>
              </div>
              <div className={styles.tpMeta}>{t(template.metaKey)}</div>
              <div className={styles.tpCta}>
                {t("economy:housingCoop.templates.read")}{" "}
                <FiArrowRight aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Closing plum panel: start-a-co-op prompt + resources/mentors list. */
export function CoopStartCta({
  onPost,
  onStory,
}: {
  onPost: () => void;
  onStory: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.startCta}>
      <div className="wrap">
        <div className={styles.scInner}>
          <div className={styles.scText}>
            <div className={styles.scEyebrow}>
              {t("economy:housingCoop.startCta.eyebrow")}
            </div>
            <h2>
              <Translation
                i18nKey="economy:housingCoop.startCta.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p>
              <Translation
                i18nKey="economy:housingCoop.startCta.body"
                components={{ em: <em /> }}
              />
            </p>
            <div className={styles.scActs}>
              <Button variant="primary" onClick={onPost}>
                {t("economy:housingCoop.startCta.postCta")}
              </Button>
              <Button variant="ghost-dark" onClick={onStory}>
                {t("economy:housingCoop.startCta.storyCta")}
              </Button>
            </div>
          </div>
          <div className={styles.scResources}>
            <div className={styles.srHead}>
              {t("economy:housingCoop.startCta.resourcesHead")}
            </div>
            {COOP_RESOURCES.map((r, i) => (
              <div className={styles.srRow} key={i}>
                <span className={styles.srLabel}>
                  {r.preKey && t(r.preKey)}
                  {r.em && <em>{r.em}</em>}
                  {r.postKey && t(r.postKey)}
                </span>
                <span className={styles.srMeta}>{t(r.metaKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
