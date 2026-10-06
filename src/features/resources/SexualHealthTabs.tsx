import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiInfo, FiPlus } from "react-icons/fi";
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
  SEXUAL_HEALTH_GUIDE_SLUG,
  TESTING_INFO,
  type TabId,
} from "./sexualHealth.data";
import type { GuideSection } from "./api/resources.api";
import { useManagedGuideSection } from "./api/useManagedGuideSection";
import { GuideBlocks } from "./GuideBody";
import { TestingClinics } from "./SexualHealthTestingClinics";
import { TestingListings } from "./SexualHealthTestingListings";
import { SuggestResourceModal } from "./SuggestResourceModal";
import { GuideRatingWidget } from "./GuideRatingWidget";
import styles from "./SexualHealthPage.module.css";

/** The editor-written section at a tab's anchor, or null for catalog copy. */
function useTabSection(tabId: TabId): GuideSection | null {
  return useManagedGuideSection(SEXUAL_HEALTH_GUIDE_SLUG, tabId);
}

/**
 * A tab's prose as an editor wrote it in the guide workspace: the section's
 * heading in the tab's title style, then its blocks. Each tab keeps its own
 * interactive parts (the directory, the question box) around it.
 */
function ManagedTabSection({ section }: { section: GuideSection }) {
  return (
    <>
      {section.heading && <h2 className={styles.h}>{section.heading}</h2>}
      <GuideBlocks section={section} isStatic={false} />
    </>
  );
}

/** The "what to expect" info cards sitting above the testing directory. */
function TestingInfoCards() {
  const { t } = useTranslation();
  return (
    <div className={styles.infoGrid}>
      {TESTING_INFO.map((card) => (
        <div
          key={card.titleKey}
          className={styles.infoCard}
          style={{ background: card.background, borderColor: card.border }}
        >
          <div className={styles.infoIcon}>
            <card.icon />
          </div>
          <div className={styles.infoTitle} style={{ color: card.color }}>
            {t(card.titleKey)}
          </div>
          <div className={styles.infoBody}>{t(card.bodyKey)}</div>
        </div>
      ))}
    </div>
  );
}

export function TestingTab() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const managedSection = useTabSection("testing");

  return (
    <>
      {managedSection ? (
        <ManagedTabSection section={managedSection} />
      ) : (
        <>
          <h2 className={styles.h}>
            <Translation
              i18nKey="resources:sexualHealth.testing.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>
            {t("resources:sexualHealth.testing.lead")}
          </p>
          <TestingInfoCards />
        </>
      )}
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
  const managedSection = useTabSection("prep");
  if (managedSection) return <ManagedTabSection section={managedSection} />;
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
        {PREP_STEPS.map((step, index) => (
          <div className={styles.prepStep} key={step.titleKey}>
            <div className={styles.psNum}>{index + 1}</div>
            <div className={styles.psBody}>
              <div className={styles.psTitle}>{t(step.titleKey)}</div>
              <div className={styles.psDesc}>{t(step.descriptionKey)}</div>
              {step.noteKey && (
                <div className={styles.psNote}>{t(step.noteKey)}</div>
              )}
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
        {PREP_FAQ.map((faqItem, index) => (
          <div
            key={faqItem.questionKey}
            className={[styles.faqItem, openFaq === index && styles.faqItemOpen]
              .filter(Boolean)
              .join(" ")}
          >
            <button
              type="button"
              className={styles.faqQ}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <span className={styles.faqQText}>{t(faqItem.questionKey)}</span>
              <span className={styles.faqArrow} aria-hidden>
                <FiPlus />
              </span>
            </button>
            {openFaq === index && (
              <div className={styles.faqA}>{t(faqItem.answerKey)}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function HivTab() {
  const { t } = useTranslation();
  const managedSection = useTabSection("hiv");
  if (managedSection) return <ManagedTabSection section={managedSection} />;
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
        {HIV_INFO.map((card) => (
          <div className={styles.infoCard} key={card.titleKey}>
            <div className={styles.infoIcon}>
              <card.icon />
            </div>
            <div className={styles.infoTitle}>{t(card.titleKey)}</div>
            <div className={styles.infoBody}>{t(card.bodyKey)}</div>
            {card.link &&
              (card.link.external ? (
                <a href={card.link.href} className={styles.infoLink}>
                  {t(card.link.labelKey)} <FiArrowRight aria-hidden />
                </a>
              ) : (
                <Link to={card.link.href} className={styles.infoLink}>
                  {t(card.link.labelKey)} <FiArrowRight aria-hidden />
                </Link>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

/** The guides tab's catalog copy: its title, lead and rated guide cards. */
function GuideCards() {
  const { t } = useTranslation();
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
        {GUIDES.map((guide) => (
          <div className={styles.infoCard} key={guide.contentKey}>
            <div className={styles.infoIcon}>
              <guide.icon />
            </div>
            <div className={styles.infoTitle}>{t(guide.titleKey)}</div>
            <div className={styles.infoBody}>{t(guide.bodyKey)}</div>
            {guide.link && (
              <Link to={guide.link.href} className={styles.infoLink}>
                {t(guide.link.labelKey)} <FiArrowRight aria-hidden />
              </Link>
            )}
            <GuideRatingWidget contentKey={guide.contentKey} />
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
  const managedSection = useTabSection("guides");
  return (
    <>
      {managedSection ? (
        <ManagedTabSection section={managedSection} />
      ) : (
        <GuideCards />
      )}
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
