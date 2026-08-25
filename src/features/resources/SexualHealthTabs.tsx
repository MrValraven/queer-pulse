import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  GUIDES,
  HIV_INFO,
  PREP_FAQ,
  PREP_STEPS,
  TESTING_INFO,
} from "./sexualHealth.data";
import { TestingClinics } from "./SexualHealthTestingClinics";
import { TestingListings } from "./SexualHealthTestingListings";
import { SuggestResourceModal } from "./SuggestResourceModal";
import { GuideRatingWidget } from "./GuideRatingWidget";
import styles from "./SexualHealthPage.module.css";

/** The "what to expect" info cards sitting above the testing directory. */
function TestingInfoCards() {
  return (
    <div className={styles.infoGrid}>
      {TESTING_INFO.map((card) => (
        <div
          key={card.title}
          className={styles.infoCard}
          style={{ background: card.background, borderColor: card.border }}
        >
          <div className={styles.infoIcon}>
            <card.icon />
          </div>
          <div className={styles.infoTitle} style={{ color: card.color }}>
            {card.title}
          </div>
          <div className={styles.infoBody}>{card.body}</div>
        </div>
      ))}
    </div>
  );
}

export function TestingTab() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.testing.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("resources:sexualHealth.testing.lead")}</p>
      <TestingInfoCards />
      {demoMode ? (
        <TestingClinics />
      ) : (
        <TestingListings onSuggest={() => setIsSuggestOpen(true)} />
      )}
      {isSuggestOpen && (
        <SuggestResourceModal
          category="sexual_health_testing"
          onClose={() => setIsSuggestOpen(false)}
        />
      )}
    </>
  );
}

export function PrepTab() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <>
      <h2 className={styles.h}>
        <Translation
          i18nKey="resources:sexualHealth.prep.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sub}>{t("resources:sexualHealth.prep.lead")}</p>
      <div className={styles.tip}>
        <div className={styles.tipIcon}>
          <FiInfo />
        </div>
        <div className={styles.tipText}>
          <Translation
            i18nKey="resources:sexualHealth.prep.tip"
            components={{ strong: <strong /> }}
          />
        </div>
      </div>
      <div className={styles.prepSteps}>
        {PREP_STEPS.map((s, i) => (
          <div className={styles.prepStep} key={s.title}>
            <div className={styles.psNum}>{i + 1}</div>
            <div className={styles.psBody}>
              <div className={styles.psTitle}>{s.title}</div>
              <div className={styles.psDesc}>{s.description}</div>
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
      <p className={styles.sub}>{t("resources:sexualHealth.hiv.lead")}</p>
      <div className={styles.hivBanner}>
        <h3>
          <Translation
            i18nKey="resources:sexualHealth.hiv.uu.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("resources:sexualHealth.hiv.uu.body")}</p>
        <div className={styles.hivStats}>
          <div className={styles.hivStat}>
            <div className={styles.n}>U=U</div>
            <div className={styles.l}>
              {t("resources:sexualHealth.hiv.uu.stat.uu.label")}
            </div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>97%</div>
            <div className={styles.l}>
              {t("resources:sexualHealth.hiv.uu.stat.rate.label")}
            </div>
          </div>
          <div className={styles.hivStat}>
            <div className={styles.n}>
              {t("resources:sexualHealth.hiv.uu.stat.free.value")}
            </div>
            <div className={styles.l}>
              {t("resources:sexualHealth.hiv.uu.stat.free.label")}
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
                  {c.link.label} <FiArrowRight aria-hidden />
                </a>
              ) : (
                <Link to={c.link.href} className={styles.infoLink}>
                  {c.link.label} <FiArrowRight aria-hidden />
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
  const { demoMode } = useDemoMode();
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
            {g.link && (
              <Link to={g.link.href} className={styles.infoLink}>
                {g.link.label} <FiArrowRight aria-hidden />
              </Link>
            )}
            <GuideRatingWidget contentKey={g.contentKey} />
          </div>
        ))}
      </div>
      {!demoMode ? (
        <div className={styles.anonBox}>
          <h3>{t("resources:sexualHealth.guides.ask.title")}</h3>
          <p>{t("resources:sexualHealth.guides.ask.liveBody")}</p>
        </div>
      ) : (
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
                aria-label={t("resources:sexualHealth.guides.ask.placeholder")}
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
      )}
    </>
  );
}
