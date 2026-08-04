import { useState } from "react";
import { Link } from "react-router-dom";
import { LuSprout } from "react-icons/lu";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { fullName, getMember } from "../members/data/members";
import { INC_MENTORS, STEPS } from "./economy.data";
import {
  CohortApplyModal,
  MentorSignupModal,
  RequestSessionModal,
} from "./IncubatorModals";
import styles from "./EconomyPage.module.css";

export function IncubatorTab() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [modal, setModal] = useState<"cohort" | "mentor" | null>(null);
  const [session, setSession] = useState<(typeof INC_MENTORS)[number] | null>(
    null,
  );
  return (
    <>
      <div className={styles.incHeroBox}>
        <div>
          <div className={styles.incH}>
            <Translation
              i18nKey="economy:incubator.hero.title"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.incP}>{t("economy:incubator.hero.body")}</p>
          <div className={styles.incBtns}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setModal("cohort")}
            >
              {t("economy:incubator.hero.applyCta")}
            </Button>
            <Button
              type="button"
              variant="ghost-dark"
              onClick={() => setModal("mentor")}
              style={{ fontSize: 14 }}
            >
              {t("economy:incubator.hero.mentorCta")}
            </Button>
          </div>
        </div>
        {demoMode && (
          <div className={styles.incStats}>
            <div className={styles.incStat}>
              <div className={styles.n}>24</div>
              <div className={styles.l}>
                {t("economy:incubator.stats.founders")}
              </div>
            </div>
            <div className={styles.incStat}>
              <div className={styles.n}>18</div>
              <div className={styles.l}>
                {t("economy:incubator.stats.mentors")}
              </div>
            </div>
            <div className={styles.incStat}>
              <div className={styles.n}>€2.4M</div>
              <div className={styles.l}>
                {t("economy:incubator.stats.raised")}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.incCols}>
        <div>
          <h3 className={styles.colH}>
            <Translation
              i18nKey="economy:incubator.programme.title"
              components={{ em: <em /> }}
            />
          </h3>
          <div className={styles.incTimeline}>
            {STEPS.map((s) => (
              <div className={styles.incStep} key={s.n}>
                <div className={styles.incStepNum}>{s.n}</div>
                <div className={styles.incStepBody}>
                  <div className={styles.incStepTitle}>{t(s.titleKey)}</div>
                  <div className={styles.incStepDesc}>{t(s.descKey)}</div>
                  <div className={styles.incStepMeta}>{t(s.metaKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className={styles.colH}>
            <Translation
              i18nKey="economy:incubator.mentors.title"
              components={{ em: <em /> }}
            />
          </h3>
          {demoMode ? (
            <div className={styles.mentorGrid}>
              {INC_MENTORS.map((mentor) => {
                const member = getMember(mentor.slug);
                if (!member) return null;
                return (
                  <div className={styles.mentorCard} key={mentor.slug}>
                    <div className={styles.mentorTop}>
                      <Avatar
                        initials={member.initials}
                        tint={member.tint}
                        src={member.photo}
                        verified={member.verified}
                        size={50}
                      />
                      <div>
                        <Link
                          to={`/members/${member.slug}`}
                          className={styles.mentorName}
                        >
                          {fullName(member)}
                        </Link>
                        <div className={styles.mentorRole}>{member.role}</div>
                      </div>
                    </div>
                    <div className={styles.mentorTags}>
                      {mentor.tags.map((tag) => (
                        <span key={tag} className={styles.mentorTag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={styles.mentorBtn}
                      onClick={() => setSession(mentor)}
                    >
                      {t("economy:incubator.mentors.requestCta")}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<LuSprout />}
              title={t("economy:incubator.mentors.empty.title")}
              description={t("economy:incubator.mentors.empty.description")}
            />
          )}
        </div>
      </div>

      {modal === "cohort" && (
        <CohortApplyModal onClose={() => setModal(null)} />
      )}
      {modal === "mentor" && (
        <MentorSignupModal onClose={() => setModal(null)} />
      )}
      {session &&
        (() => {
          const member = getMember(session.slug);
          if (!member) return null;
          return (
            <RequestSessionModal
              mentorName={fullName(member)}
              mentorRole={member.role}
              onClose={() => setSession(null)}
            />
          );
        })()}
    </>
  );
}
