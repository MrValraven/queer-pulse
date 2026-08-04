import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, EmptyState, Reveal } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/useConnect";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useTherapists } from "./api/useTherapists";
import { THERAPISTS, CRISIS, HARM } from "./wellbeing.data";
import styles from "./resources.module.css";

/** Community-vetted therapist directory. */
export function TherapistsSection() {
  const { openConnect } = useConnect();
  const { t } = useTranslation();
  // Live mode has no therapist backend, so the mock directory (named personas +
  // a working "Request intro" CTA) is fabricated. Never surface bookable fake
  // therapists against the real API; show an honest coming-soon instead. Demo
  // mode keeps the `THERAPISTS` mock.
  const { comingSoon } = useTherapists();
  return (
    <section
      className={`${styles.section} ${styles.sectionPaper}`}
      id="therapists"
    >
      <div className="wrap">
        <Reveal as="h2">
          <Translation
            i18nKey="resources:wellbeing.therapists.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          <Translation
            i18nKey="resources:wellbeing.therapists.lead"
            components={{ a: <Link to={routes.contact} /> }}
          />
        </Reveal>
        {comingSoon ? (
          <EmptyState
            icon={<FiHeart />}
            title={t("resources:therapistProfilePage.live.title")}
            description={t("resources:therapistProfilePage.live.body")}
            action={{
              label: t("resources:therapistProfilePage.live.cta"),
              to: routes.mentalHealth,
            }}
          />
        ) : (
        <div className={styles.grid}>
          {THERAPISTS.map((therapist, index) => (
            <Reveal
              key={therapist.name}
              className={styles.card}
              delay={index * 55}
            >
              <div className={styles.cardName}>{therapist.name}</div>
              <div className={styles.cardSpec}>{therapist.spec}</div>
              <div className={styles.tags}>
                {therapist.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.cardFoot}>
                <span className={styles.cardLoc}>{therapist.loc}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className={styles.cardCta}
                  onClick={() => openConnect()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openConnect();
                    }
                  }}
                >
                  {t("resources:wellbeing.therapists.requestIntroCta")}
                </span>
              </div>
            </Reveal>
          ))}
          <Reveal
            className={`${styles.card} ${styles.cardDashed}`}
            delay={THERAPISTS.length * 55}
          >
            <div>
              {t("resources:wellbeing.therapists.applyPrompt")}
              <br />
              <Link
                to={routes.contact}
                style={{ color: "var(--plum)", fontWeight: 600 }}
              >
                {t("resources:wellbeing.therapists.applyCta")}
              </Link>
            </div>
          </Reveal>
        </div>
        )}
      </div>
    </section>
  );
}

/** Plum peer-support strip with headline stats. */
export function PeerSupportSection() {
  const { t } = useTranslation();
  return (
    <section
      className={`${styles.section} ${styles.sectionCream}`}
      id="peer-support"
    >
      <div className="wrap">
        <Reveal className={styles.plumStrip}>
          <div>
            <h3>
              <Translation
                i18nKey="resources:wellbeing.peer.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("resources:wellbeing.peer.body")}</p>
            <div className={styles.plumActions}>
              <Button variant="ghost-dark" to={routes.forum}>
                {t("resources:wellbeing.peer.joinCta")}
              </Button>
              <Button variant="ghost-dark" href="#crisis">
                {t("resources:wellbeing.peer.crisisCta")}
              </Button>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statN}>340</div>
              <div className={styles.statL}>
                {t("resources:wellbeing.peer.stat.members.label")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>24h</div>
              <div className={styles.statL}>
                {t("resources:wellbeing.peer.stat.moderation.label")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>100%</div>
              <div className={styles.statL}>
                {t("resources:wellbeing.peer.stat.confidential.label")}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Crisis & emergency contact cards. */
export function CrisisSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.section} ${styles.sectionPaper}`} id="crisis">
      <div className="wrap">
        <Reveal as="h2">
          <Translation
            i18nKey="resources:wellbeing.crisisSection.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          <Translation
            i18nKey="resources:wellbeing.crisisSection.lead"
            components={{ strong: <strong /> }}
          />
        </Reveal>
        <div className={styles.gridNarrow} style={{ display: "grid" }}>
          {CRISIS.map((item, index) => (
            <Reveal key={item.name} className={styles.card} delay={index * 55}>
              <div className={styles.cardName} style={{ fontSize: 18 }}>
                {item.name}
              </div>
              <div className={styles.cardSpec}>{t(item.descriptionKey)}</div>
              <div className={styles.crisisNum}>{item.number}</div>
              <div className={styles.crisisHours}>{t(item.hoursKey)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Harm-reduction information cards. */
export function HarmReductionSection() {
  const { t } = useTranslation();
  return (
    <section
      className={`${styles.section} ${styles.sectionCream}`}
      id="harm-reduction"
    >
      <div className="wrap">
        <Reveal as="h2">
          <Translation
            i18nKey="resources:wellbeing.harm.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.leadP}>
          {t("resources:wellbeing.harm.lead")}
        </Reveal>
        <div className={styles.gridNarrow} style={{ display: "grid" }}>
          {HARM.map((item, index) => (
            <Reveal
              key={item.titleKey}
              className={styles.card}
              delay={index * 55}
            >
              <div className={styles.cardName} style={{ fontSize: 18 }}>
                {t(item.titleKey)}
              </div>
              <div className={styles.cardSpec}>{t(item.descriptionKey)}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
