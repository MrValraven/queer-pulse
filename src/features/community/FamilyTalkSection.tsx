import { FiArrowRight, FiUsers } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { FORUM, LEGAL, MENTORSHIP, TALK_CARDS } from "./family.data";
import styles from "./FamilyPage.module.css";

export function FamilyTalkSection() {
  const { t } = useTranslation();
  // The peer-mentor cards are fabricated parents in the prototype. Live has no
  // mentor directory yet, so gate them behind demo and invite people to sign up.
  const { demoMode } = useDemoMode();
  return (
    <>
      <section className={styles.talk}>
        <div className="wrap">
          <div className={styles.talkInner}>
            <div className={styles.talkLeft}>
              <h2>
                <Translation
                  i18nKey="community:family.talk.heading"
                  components={{ em: <em /> }}
                />
              </h2>
              <p>{t("community:family.talk.body")}</p>
              <div className={styles.talkBtns}>
                <Button to={MENTORSHIP} variant="primary" size="lg">
                  {t("community:family.talk.findMentorCta")}
                </Button>
                <Button to={FORUM} variant="ghost-dark" size="lg">
                  {t("community:family.talk.networkCta")}{" "}
                  <FiArrowRight aria-hidden />
                </Button>
              </div>
            </div>
            <div className={styles.talkCards}>
              {demoMode ? (
                TALK_CARDS.map((c) => (
                  <div className={styles.talkCard} key={c.name}>
                    <div
                      className={styles.tcAv}
                      style={{ background: c.background, color: c.color }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <div className={styles.tcName}>{c.name}</div>
                      <div className={styles.tcDetail}>{c.detail}</div>
                      <div className={styles.tcNote}>{c.note}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={<FiUsers />}
                  title={t("community:family.talk.liveEmpty.title")}
                  description={t("community:family.talk.liveEmpty.description")}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.forumCta}>
        <div className="wrap">
          <div className={styles.forumCtaInner}>
            <div className={styles.forumCtaText}>
              <h3>
                <Translation
                  i18nKey="community:family.talk.forumCta.heading"
                  components={{ em: <em /> }}
                />
              </h3>
              <p>{t("community:family.talk.forumCta.body")}</p>
            </div>
            <div className={styles.forumCtaBtns}>
              <Button to={FORUM} variant="primary">
                {t("community:family.talk.forumCta.openForumCta")}
              </Button>
              <Button to={LEGAL} variant="ghost">
                {t("community:family.talk.forumCta.legalResourcesCta")}{" "}
                <FiArrowRight aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
