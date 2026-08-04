import { useState } from "react";
import { FiArrowRight, FiHeart } from "react-icons/fi";
import {
  Avatar,
  Button,
  EmptyState,
  FilterChips,
  Reveal,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EXPERIENCES,
  SNS,
  LANGS,
  type Therapist,
} from "./mentalHealth.data";
import { useTherapists } from "./api/useTherapists";
import { TherapistProfileModal } from "./TherapistProfileModal";
import styles from "./MentalHealthPage.module.css";

export function TherapistSection() {
  const { t } = useTranslation();
  const { therapists: allTherapists, comingSoon } = useTherapists();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Therapist | null>(null);

  const therapists =
    filter === "all"
      ? allTherapists
      : allTherapists.filter((th) => th.langs.includes(filter));

  return (
    <section className={styles.sec}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="resources:mentalHealth.therapists.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:mentalHealth.therapists.lead")}</p>
        </Reveal>
        {comingSoon ? (
          <EmptyState
            icon={<FiHeart />}
            title={
              <Translation
                i18nKey="resources:mentalHealth.therapists.comingSoon.title"
                components={{ em: <em /> }}
              />
            }
            description={
              <Translation
                i18nKey="resources:mentalHealth.therapists.comingSoon.body"
                components={{ b: <b /> }}
                values={{
                  toggleName: t("shared:accountMenu.controls.populatePlatform"),
                }}
              />
            }
          />
        ) : (
          <>
        <div className={styles.thFilter}>
          <span className={styles.thFilterLabel} id="mh-therapist-lang-label">
            {t("resources:mentalHealth.therapists.filterLabel")}
          </span>
          <FilterChips
            labelledBy="mh-therapist-lang-label"
            tone="jade"
            value={filter}
            onChange={setFilter}
            options={LANGS.map((l) => ({
              value: l,
              label:
                l === "all"
                  ? t("resources:mentalHealth.therapists.allLanguages")
                  : l,
            }))}
          />
        </div>
        <div className={styles.therapistGrid}>
          {therapists.map((therapist, index) => (
            <Reveal
              key={therapist.id}
              as="button"
              type="button"
              className={styles.therapistCard}
              delay={Math.min(index, 8) * 60}
              onClick={() => setActive(therapist)}
              aria-label={t(
                "resources:mentalHealth.therapists.viewProfileAriaLabel",
                { name: therapist.name },
              )}
            >
              <div className={styles.tcTop}>
                <Avatar
                  initials={therapist.initials}
                  size={56}
                  src={therapist.photo}
                  alt={therapist.name}
                  className={styles.tcAv}
                />
                <div className={styles.tcHeadText}>
                  <div className={styles.tcName}>{therapist.name}</div>
                  <div className={styles.tcCreds}>{therapist.creds}</div>
                </div>
                <span
                  className={[
                    styles.tcStatus,
                    therapist.acceptingNew
                      ? styles.tcStatusOpen
                      : styles.tcStatusFull,
                  ].join(" ")}
                >
                  <span className={styles.tcStatusDot} />
                  {therapist.acceptingNew
                    ? t("resources:mentalHealth.therapists.accepting")
                    : t("resources:mentalHealth.therapists.waitlist")}
                </span>
              </div>
              <div className={styles.tcTags}>
                {therapist.langs.map((l) => (
                  <span
                    key={l}
                    className={`${styles.tcTag} ${styles.tcTagLang}`}
                  >
                    {l}
                  </span>
                ))}
                {therapist.specs.map((s) => (
                  <span key={s} className={styles.tcTag}>
                    {s}
                  </span>
                ))}
              </div>
              <p className={styles.tcNote}>{therapist.note}</p>
              <div className={styles.tcFoot}>
                <span className={styles.tcFormat}>{therapist.format}</span>
                <span className={styles.tcContact}>
                  {t("resources:mentalHealth.therapists.viewProfileCta")}{" "}
                  <FiArrowRight aria-hidden />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
          </>
        )}
      </div>
      {active && (
        <TherapistProfileModal
          therapist={active}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}

export function ExperiencesSection() {
  const { t } = useTranslation();
  return (
    <section className={`${styles.sec} ${styles.alt}`}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="resources:mentalHealth.experiences.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:mentalHealth.experiences.lead")}</p>
        </Reveal>
        <div className={styles.expGrid}>
          {EXPERIENCES.map((experience, index) => (
            <Reveal
              className={styles.expCard}
              key={experience.titleKey}
              delay={Math.min(index, 8) * 60}
            >
              <div className={styles.expBar} />
              <div>
                <div className={styles.expTitle}>{t(experience.titleKey)}</div>
                <div className={styles.expText}>{t(experience.textKey)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SnsSection({
  forum,
  mentorship,
}: {
  forum: string;
  mentorship: string;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.sec}>
      <div className="wrap">
        <Reveal className={styles.secHead}>
          <h2>
            <Translation
              i18nKey="resources:mentalHealth.sns.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("resources:mentalHealth.sns.lead")}</p>
        </Reveal>
        <div className={styles.snsGrid}>
          {SNS.map((step, index) => (
            <Reveal
              className={styles.snsCard}
              key={step.number}
              delay={index * 60}
            >
              <div className={styles.snsNum}>{step.number}</div>
              <div className={styles.snsTitle}>{t(step.titleKey)}</div>
              <div className={styles.snsText}>{t(step.textKey)}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className={styles.peerStrip} delay={60}>
          <div>
            <h3>
              <Translation
                i18nKey="resources:mentalHealth.sns.peer.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("resources:mentalHealth.sns.peer.body")}</p>
          </div>
          <div className={styles.peerBtns}>
            <Button to={forum} variant="primary">
              {t("resources:mentalHealth.sns.peer.joinCta")}
            </Button>
            <Button to={mentorship} variant="ghost-dark">
              {t("resources:mentalHealth.sns.peer.mentorCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
