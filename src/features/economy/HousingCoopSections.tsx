import { Button, HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  COOP_STATS,
  COOP_PHASES,
  FORMING_COOPS,
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
          <Reveal className={styles.statsCard} delay={160}>
            <div className={styles.statsHead}>
              {t("economy:housingCoop.hero.statsHead")}
            </div>
            {COOP_STATS.map((s) => (
              <div className={styles.statRow} key={s.labelKey}>
                <span className="k">{t(s.labelKey)}</span>
                <span className="v">
                  {s.value}
                  {s.valueKey && t(s.valueKey)}
                  {s.em && <em>{s.em}</em>}
                </span>
              </div>
            ))}
          </Reveal>
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
            <Reveal className={styles.phase} key={p.num} delay={i * 60}>
              <div className={styles.phaseNum}>{p.num}</div>
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
        <div className={styles.ccDesc}>{coop.desc}</div>
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
        <div className={styles.avStack} aria-hidden>
          {coop.faces.map((f, i) => (
            <div className={`${styles.av} ${FACE_TINT[f.tint]}`} key={i}>
              {f.initials}
            </div>
          ))}
        </div>
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

/** The grid of co-ops currently forming or operational. */
export function CoopGrid({
  onCta,
  onSeeAll,
}: {
  onCta: (coop: FormingCoop) => void;
  onSeeAll: () => void;
}) {
  const { t } = useTranslation();
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
          <button type="button" className={styles.all} onClick={onSeeAll}>
            {t("economy:housingCoop.grid.seeAll")}
          </button>
        </div>
        <div className={styles.coopGrid}>
          {FORMING_COOPS.map((coop) => (
            <CoopCard key={coop.id} coop={coop} onCta={onCta} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Downloadable formation templates. */
export function CoopTemplates({
  onDownload,
}: {
  onDownload: (name: string) => void;
}) {
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
          {COOP_TEMPLATES.map((template) => {
            const name = `${t(template.nameKey)} ${t(template.nameEmKey)}`;
            return (
              <button
                type="button"
                className={styles.tpCard}
                key={template.nameKey}
                onClick={() => onDownload(name)}
              >
                <div className={styles.tpTag}>{t(template.tagKey)}</div>
                <div className={styles.tpName}>
                  {t(template.nameKey)} <em>{t(template.nameEmKey)}</em>
                </div>
                <div className={styles.tpMeta}>{t(template.metaKey)}</div>
                <div className={styles.tpCta}>
                  {t("economy:housingCoop.templates.download")}
                </div>
              </button>
            );
          })}
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
