import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiInfo, FiMapPin, FiStar } from "react-icons/fi";
import { Button, EmptyState, FilterChips } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  CLINICS,
  CLINIC_FILTERS,
  GUIDES,
  HIV_INFO,
  PREP_FAQ,
  PREP_STEPS,
  TESTING_INFO,
  TYPE_CLASS,
  type ClinicType,
} from "./sexualHealth.data";
import styles from "./SexualHealthPage.module.css";

export function TestingTab() {
  const { t } = useTranslation();
  const [clinicFilter, setClinicFilter] = useState<ClinicType | "all">("all");
  const [openClinic, setOpenClinic] = useState<string | null>(null);
  const [nomination, setNomination] = useState("");
  const [nominated, setNominated] = useState(false);
  const clinics = CLINICS.filter(
    (c) => clinicFilter === "all" || c.type === clinicFilter,
  );
  const clinicFilterOptions = useMemo(
    () => CLINIC_FILTERS.map((f) => ({ value: f.id, label: t(f.labelKey) })),
    [t],
  );

  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.testing.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("resources:sexualHealth.testing.lead")}</p>
      <div className={styles.infoGrid}>
        {TESTING_INFO.map((c) => (
          <div
            key={c.title}
            className={styles.infoCard}
            style={{ background: c.bg, borderColor: c.border }}
          >
            <div className={styles.infoIcon}>
              <c.icon />
            </div>
            <div className={styles.infoTitle} style={{ color: c.color }}>
              {c.title}
            </div>
            <div className={styles.infoBody}>{c.body}</div>
          </div>
        ))}
      </div>

      <FilterChips
        className={styles.clinicFilters}
        options={clinicFilterOptions}
        value={clinicFilter}
        onChange={(v) => setClinicFilter(v as ClinicType | "all")}
      />

      <div className={styles.clinicList}>
        {clinics.length === 0 && (
          <EmptyState
            compact
            icon={<FiMapPin />}
            title={t("resources:sexualHealth.testing.empty.title")}
            description={t("resources:sexualHealth.testing.empty.description")}
            action={{
              label: t("resources:sexualHealth.testing.empty.clearCta"),
              onClick: () => setClinicFilter("all"),
            }}
          />
        )}
        {clinics.map((c) => {
          const isOpen = openClinic === c.name;
          return (
            <div className={styles.clinicCard} key={c.name}>
              <div>
                <div
                  className={`${styles.ccType} ${styles[TYPE_CLASS[c.type]]}`}
                >
                  {c.typeLabel}
                </div>
                <div className={styles.ccName}>{c.name}</div>
                <div className={styles.ccDesc}>{c.desc}</div>
                <div className={styles.ccMeta}>
                  {c.meta.map((m) => (
                    <span key={m.text}>
                      <m.icon /> {m.text}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.ccRight}>
                {c.verified && (
                  <div className={styles.ccBadge}>
                    {t(
                      "resources:sexualHealth.testing.clinicCard.verifiedBadge",
                    )}{" "}
                    <FiCheck />
                  </div>
                )}
                <button
                  type="button"
                  className={[styles.ccBtn, isOpen && styles.ccBtnOpen]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setOpenClinic(isOpen ? null : c.name)}
                  aria-expanded={isOpen}
                >
                  {isOpen
                    ? t(
                        "resources:sexualHealth.testing.clinicCard.hideDetailsCta",
                      )
                    : t(
                        "resources:sexualHealth.testing.clinicCard.viewDetailsCta",
                      )}
                </button>
                {c.review && (
                  <div className={styles.ccReview}>
                    <FiStar /> {c.review}
                  </div>
                )}
              </div>
              {isOpen && (
                <div className={styles.ccDetails}>
                  <div className={styles.ccDetailRow}>
                    <div className={styles.ccDetailLabel}>
                      {t(
                        "resources:sexualHealth.testing.clinicCard.testsLabel",
                      )}
                    </div>
                    <div className={styles.ccDetailVal}>{c.details.tests}</div>
                  </div>
                  <div className={styles.ccDetailRow}>
                    <div className={styles.ccDetailLabel}>
                      {t(
                        "resources:sexualHealth.testing.clinicCard.bringLabel",
                      )}
                    </div>
                    <div className={styles.ccDetailVal}>{c.details.bring}</div>
                  </div>
                  <div className={styles.ccDetailRow}>
                    <div className={styles.ccDetailLabel}>
                      {t(
                        "resources:sexualHealth.testing.clinicCard.accessLabel",
                      )}
                    </div>
                    <div className={styles.ccDetailVal}>{c.details.access}</div>
                  </div>
                  <div className={styles.ccDetailRow}>
                    <div className={styles.ccDetailLabel}>
                      {t("resources:sexualHealth.testing.clinicCard.noteLabel")}
                    </div>
                    <div className={styles.ccDetailVal}>{c.details.note}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.anonBox}>
        {nominated ? (
          <div className={styles.anonDone}>
            <span className={styles.anonDoneIcon} aria-hidden>
              <FiCheck />
            </span>
            <div className={styles.anonDoneTitle}>
              <Translation
                i18nKey="resources:sexualHealth.testing.nominate.doneTitle"
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.anonDoneBody}>
              {t("resources:sexualHealth.testing.nominate.doneBody")}
            </p>
            <Button variant="ghost-dark" onClick={() => setNominated(false)}>
              {t("resources:sexualHealth.testing.nominate.anotherCta")}
            </Button>
          </div>
        ) : (
          <>
            <h3>{t("resources:sexualHealth.testing.nominate.title")}</h3>
            <p>{t("resources:sexualHealth.testing.nominate.body")}</p>
            <textarea
              className={styles.anonInput}
              style={{ minHeight: 52 }}
              value={nomination}
              onChange={(e) => setNomination(e.target.value)}
              placeholder={t(
                "resources:sexualHealth.testing.nominate.placeholder",
              )}
            />
            <div style={{ marginTop: 12 }}>
              <Button
                variant="primary"
                disabled={nomination.trim().length < 5}
                onClick={() => {
                  setNomination("");
                  setNominated(true);
                }}
              >
                {t("resources:sexualHealth.testing.nominate.submitCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function PrepTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.prep.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>
        PrEP (pre-exposure prophylaxis) is available free through the SNS for
        eligible people. When taken correctly it is over 99% effective at
        preventing HIV. Here's how to access it.
      </p>
      <div className={styles.tip}>
        <div className={styles.tipIcon}>
          <FiInfo />
        </div>
        <div className={styles.tipText}>
          <strong>
            Portugal was one of the first European countries to make PrEP free.
          </strong>{" "}
          You don't need private insurance. The process involves a simple
          eligibility check, blood tests, and a prescription — the whole pathway
          takes about 4–6 weeks the first time.
        </div>
      </div>
      <div className={styles.prepSteps}>
        {PREP_STEPS.map((s, i) => (
          <div className={styles.prepStep} key={s.title}>
            <div className={styles.psNum}>{i + 1}</div>
            <div className={styles.psBody}>
              <div className={styles.psTitle}>{s.title}</div>
              <div className={styles.psDesc}>{s.desc}</div>
              {s.note && <div className={styles.psNote}>{s.note}</div>}
            </div>
          </div>
        ))}
      </div>
      <h3 className={styles.subHead}>
        <Translation
          i18nKey="resources:sexualHealth.prep.faqTitle"
          components={{ em: <em /> }}
        />
      </h3>
      <div className={styles.faq}>
        {PREP_FAQ.map((f, i) => (
          <div
            key={f.q}
            className={[styles.faqItem, openFaq === i && styles.faqItemOpen]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className={styles.faqQ}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <span className={styles.faqQText}>{f.q}</span>
              <span className={styles.faqArrow}>+</span>
            </button>
            {openFaq === i && <div className={styles.faqA}>{f.a}</div>}
          </div>
        ))}
      </div>
    </>
  );
}

export function HivTab() {
  const { t } = useTranslation();
  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.hiv.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>
        Honest, current information. HIV is a manageable condition. With
        treatment, people with HIV live full, long lives and can't pass the
        virus on.
      </p>
      <div className={styles.hivBanner}>
        <h3>
          Undetectable = <em>Untransmittable.</em>
        </h3>
        <p>
          U=U is one of the most important facts in sexual health. People living
          with HIV who are on effective treatment and have an undetectable viral
          load cannot sexually transmit HIV to their partners. This is
          scientifically established and endorsed by every major health
          authority.
        </p>
        <div className={styles.hivStats}>
          <div className={styles.hivStat}>
            <div className={styles.n}>U=U</div>
            <div className={styles.l}>
              Undetectable = Untransmittable. Confirmed by the CDC, WHO, and
              400+ health organisations globally.
            </div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>97%</div>
            <div className={styles.l}>
              of people on treatment in Portugal achieve an undetectable viral
              load within 6 months.
            </div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>Free</div>
            <div className={styles.l}>
              HIV treatment (antiretrovirals) is free for all residents through
              the SNS.
            </div>
          </div>
        </div>
        <div className={styles.hivBtns}>
          <Button to={routes.communities} variant="primary">
            {t("resources:sexualHealth.hiv.findServicesCta")}
          </Button>
        </div>
      </div>
      <div className={styles.infoGrid}>
        {HIV_INFO.map((c) => (
          <div className={styles.infoCard} key={c.title}>
            <div className={styles.infoIcon}>
              <c.icon />
            </div>
            <div className={styles.infoTitle}>{c.title}</div>
            <div className={styles.infoBody}>{c.body}</div>
            {c.link &&
              (c.link.external ? (
                <a href={c.link.href} className={styles.infoLink}>
                  {c.link.label}
                </a>
              ) : (
                <Link to={c.link.href} className={styles.infoLink}>
                  {c.link.label}
                </Link>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function GuidesTab() {
  const { t } = useTranslation();
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState(false);
  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.guides.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("resources:sexualHealth.guides.lead")}</p>
      <div className={styles.infoGrid}>
        {GUIDES.map((g) => (
          <div className={styles.infoCard} key={g.title}>
            <div className={styles.infoIcon}>
              <g.icon />
            </div>
            <div className={styles.infoTitle}>{g.title}</div>
            <div className={styles.infoBody}>{g.body}</div>
            {g.link &&
              (g.link.href === "#" ? (
                <span className={styles.infoLink}>{g.link.label}</span>
              ) : (
                <Link to={g.link.href} className={styles.infoLink}>
                  {g.link.label}
                </Link>
              ))}
          </div>
        ))}
      </div>
      <div className={styles.anonBox}>
        {asked ? (
          <div className={styles.anonDone}>
            <span className={styles.anonDoneIcon} aria-hidden>
              <FiCheck />
            </span>
            <div className={styles.anonDoneTitle}>
              <Translation
                i18nKey="resources:sexualHealth.guides.ask.doneTitle"
                components={{ em: <em /> }}
              />
            </div>
            <p className={styles.anonDoneBody}>
              {t("resources:sexualHealth.guides.ask.doneBody")}
            </p>
            <Button variant="ghost-dark" onClick={() => setAsked(false)}>
              {t("resources:sexualHealth.guides.ask.anotherCta")}
            </Button>
          </div>
        ) : (
          <>
            <h3>{t("resources:sexualHealth.guides.ask.title")}</h3>
            <p>{t("resources:sexualHealth.guides.ask.body")}</p>
            <textarea
              className={styles.anonInput}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("resources:sexualHealth.guides.ask.placeholder")}
            />
            <div className={styles.anonFoot}>
              <span className={styles.anonNote}>
                {t("resources:sexualHealth.guides.ask.anonymousNote")}
              </span>
              <Button
                variant="primary"
                disabled={question.trim().length < 5}
                onClick={() => {
                  setQuestion("");
                  setAsked(true);
                }}
              >
                {t("resources:sexualHealth.guides.ask.submitCta")}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
