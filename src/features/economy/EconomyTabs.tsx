import { useState } from "react";
import { Link } from "react-router-dom";
import { FiDollarSign } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { fullName, getMember } from "../members/data/members";
import {
  BADGE_CLASS,
  CALC_TOOLS,
  COMMUNITY_TOOLS,
  INC_MENTORS,
  SALARIES,
  SAL_FILTERS,
  STEPS,
  TOOLS,
  type Sector,
  type ToolCard,
} from "./economy.data";
import { SalarySubmitModal } from "./SalarySubmitModal";
import {
  CohortApplyModal,
  MentorSignupModal,
  RequestSessionModal,
} from "./IncubatorModals";
import styles from "./EconomyPage.module.css";

export function IncubatorTab() {
  const { t } = useTranslation();
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
          <div className={styles.mentorGrid}>
            {INC_MENTORS.map((m) => {
              const member = getMember(m.slug);
              if (!member) return null;
              return (
                <div className={styles.mentorCard} key={m.slug}>
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
                    {m.tags.map((t) => (
                      <span key={t} className={styles.mentorTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.mentorBtn}
                    onClick={() => setSession(m)}
                  >
                    {t("economy:incubator.mentors.requestCta")}
                  </button>
                </div>
              );
            })}
          </div>
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

/** A grid of launcher cards linking out to the real tool pages. */
function ToolGrid({ tools }: { tools: ToolCard[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.toolsGrid}>
      {tools.map((tool) => (
        <Link className={styles.toolCard} key={tool.titleKey} to={tool.to}>
          <div className={styles.toolIcon}>
            <tool.icon />
          </div>
          <div className={styles.toolTitle}>{t(tool.titleKey)}</div>
          <div className={styles.toolDesc}>{t(tool.descKey)}</div>
          <span className={styles.toolCtaBtn}>{t(tool.ctaKey)} →</span>
        </Link>
      ))}
    </div>
  );
}

export function FreelanceTab() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            <Translation
              i18nKey="economy:freelance.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.econSub}>{t("economy:freelance.sub")}</p>
        </div>
      </div>

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.documents"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={TOOLS} />

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.numbers"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={CALC_TOOLS} />

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.together"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={COMMUNITY_TOOLS} />
    </>
  );
}

export function SalaryTab() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [sector, setSector] = useState<Sector | "all">("all");
  const [modal, setModal] = useState(false);
  const salaries = SALARIES.filter(
    (s) => sector === "all" || s.sector === sector,
  );

  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            <Translation
              i18nKey="economy:salary.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.econSub}>{t("economy:salary.sub")}</p>
        </div>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setModal(true)}
        >
          {t("economy:salary.submitCta")}
        </button>
      </div>
      <div className={styles.salFilters}>
        {SAL_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={[styles.salChip, sector === f.id && styles.salChipActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSector(f.id)}
          >
            {t(f.labelKey)}
          </button>
        ))}
      </div>
      <div className={styles.salTable}>
        <div className={styles.salHeader}>
          <div className={styles.salHcell}>
            {t("economy:salary.table.role")}
          </div>
          <div className={styles.salHcell}>
            {t("economy:salary.table.annual")}
          </div>
          <div className={styles.salHcell}>
            {t("economy:salary.table.experience")}
          </div>
          <div className={`${styles.salHcell} ${styles.salTypeCol}`}>
            {t("economy:salary.table.type")}
          </div>
        </div>
        {salaries.length === 0 ? (
          <EmptyState
            compact
            icon={<FiDollarSign />}
            title={t("economy:salary.empty.title")}
            description={t("economy:salary.empty.description")}
            action={{
              label: t("economy:salary.empty.clear"),
              onClick: () => setSector("all"),
            }}
          />
        ) : (
          salaries.map((s) => (
            <div
              className={styles.salRow}
              key={`${s.role}-${s.sector}-${s.money}`}
            >
              <div>
                <div className={styles.salRole}>{s.role}</div>
                <div className={styles.salSector}>{s.sectorLabel}</div>
              </div>
              <div className={`${styles.salCell} ${styles.salMoney}`}>
                {s.money}
              </div>
              <div className={styles.salCell}>
                <span className={styles.salExp}>{s.exp}</span>
              </div>
              <div className={`${styles.salCell} ${styles.salTypeCol}`}>
                <span
                  className={`${styles.salBadge} ${styles[BADGE_CLASS[s.type]]}`}
                >
                  {s.typeLabel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={styles.salAnon}>{t("economy:salary.disclaimer")}</div>
      <div className={styles.salSubmitBox}>
        <p>{t("economy:salary.helpBody")}</p>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={() => setModal(true)}
        >
          {t("economy:salary.submitLong")}
        </button>
      </div>

      {modal && (
        <SalarySubmitModal
          onClose={() => setModal(false)}
          onSubmit={() => {
            setModal(false);
            showToast(t("economy:salary.submitToast"), "success");
          }}
        />
      )}
    </>
  );
}
