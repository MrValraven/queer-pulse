import { useState, type ReactNode } from "react";
import { FiBookOpen, FiBriefcase, FiCheck, FiImage, FiRadio } from "react-icons/fi";
import { Avatar, Button, EmptyState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  COMMISSION_CAT_LABEL_KEY,
  COMMISSIONS,
  GALLERY,
  PICK_KIND_LABEL_KEY,
  PICKS,
  THREADS,
  type Commission,
} from "./culture.data";
import {
  SuggestPickModal,
  PostProjectModal,
  SubmitWorkModal,
  SubmitPlaylistModal,
} from "./CultureFormModals";
import { CommissionInterestModal } from "./CommissionInterestModal";
import styles from "./CulturePage.module.css";

function SectionHeader({
  title,
  sub,
  action,
}: {
  title: ReactNode;
  sub: string;
  action: ReactNode;
}) {
  return (
    <div className={styles.secHeader}>
      <div>
        <h2 className={styles.secHead}>{title}</h2>
        <div className={styles.subLabel}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

export function ClubSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const [picking, setPicking] = useState(false);
  return (
    <section>
      <SectionHeader
        title={
          <Translation
            i18nKey="culture:club.picksHeading"
            components={{ em: <em /> }}
          />
        }
        sub={t("culture:club.picksSub")}
        action={
          <Button onClick={() => setPicking(true)}>
            {t("culture:club.suggestPickCta")}
          </Button>
        }
      />

      {demoMode ? (
        <>
          <div className={styles.picksGrid}>
            {PICKS.map((pick) => (
              <article key={pick.title} className={styles.pickCard}>
                <div className={`${styles.pickCover} ${styles[pick.kind]}`}>
                  <span
                    className={`${styles.pickBadge} ${styles[`badge_${pick.kind}`]}`}
                  >
                    {t(PICK_KIND_LABEL_KEY[pick.kind])}
                  </span>
                  <pick.emoji />
                </div>
                <div className={styles.pickBody}>
                  <div className={styles.pickTitle}>{pick.title}</div>
                  <div className={styles.pickAuthor}>{pick.author}</div>
                  <div className={styles.pickMeta}>
                    <span className={styles.pickDisc}>
                      {t("culture:club.picks.discussing", {
                        count: pick.discussingCount,
                      })}
                    </span>
                    <span>·</span>
                    <span>
                      {t(pick.eventKey, {
                        date: fmt.date(pick.eventDate, {
                          day: "numeric",
                          month: "short",
                        }),
                      })}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.threadHead}>
            <h3 className={styles.subHead}>
              <Translation
                i18nKey="culture:club.discussionsHeading"
                components={{ em: <em /> }}
              />
            </h3>
            <Button variant="ghost" onClick={() => setPicking(true)}>
              {t("culture:club.suggestPickCta")}
            </Button>
          </div>
          <div className={styles.threadList}>
            {THREADS.map((thread) => (
              <article key={thread.question} className={styles.threadItem}>
                <Avatar
                  initials={thread.initials}
                  tint={thread.tint}
                  size={36}
                />
                <div className={styles.threadBody}>
                  <div className={styles.threadQ}>{thread.question}</div>
                  <div className={styles.threadMeta}>{thread.meta}</div>
                </div>
                <div className={styles.threadReplies}>
                  {t("culture:club.replies", { count: thread.replies })}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<FiBookOpen />}
          title={t("culture:club.emptyLive.title")}
          description={t("culture:club.emptyLive.description")}
        />
      )}

      {picking && <SuggestPickModal onClose={() => setPicking(false)} />}
    </section>
  );
}

function CommissionCard({ commission }: { commission: Commission }) {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <article className={styles.projCard}>
      <div className={`${styles.pcPill} ${styles[`pill_${commission.category}`]}`}>
        {t(COMMISSION_CAT_LABEL_KEY[commission.category])}
      </div>
      <div className={styles.pcTitle}>{commission.title}</div>
      <p className={styles.pcDesc}>{commission.description}</p>
      <div className={styles.pcSeeking}>{commission.seeking}</div>
      <div className={styles.pcTags}>
        {commission.tags.map((tag) => (
          <span key={tag} className={styles.pcTag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.pcFoot}>
        <div className={styles.pcWho}>
          <Avatar
            initials={commission.who.initials}
            tint={commission.who.tint}
            size={28}
          />
          {commission.who.name} · {commission.who.role}
        </div>
        <Button
          variant={sent ? "jade" : "ghost"}
          onClick={() => setOpen(true)}
          disabled={sent}
        >
          {sent ? (
            <>
              {t("culture:commissions.interestSent")} <FiCheck />
            </>
          ) : (
            t("culture:commissions.expressInterestCta")
          )}
        </Button>
      </div>
      {open && (
        <CommissionInterestModal
          commission={commission}
          onClose={() => setOpen(false)}
          onSent={() => setSent(true)}
        />
      )}
    </article>
  );
}

export function CommissionsSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [posting, setPosting] = useState(false);
  return (
    <section>
      <SectionHeader
        title={
          <Translation
            i18nKey="culture:commissions.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("culture:commissions.sub")}
        action={
          <Button onClick={() => setPosting(true)}>
            {t("culture:commissions.postProjectCta")}
          </Button>
        }
      />
      {demoMode ? (
        <div className={styles.projBoard}>
          {COMMISSIONS.map((commission) => (
            <CommissionCard key={commission.title} commission={commission} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FiBriefcase />}
          title={t("culture:commissions.emptyLive.title")}
          description={t("culture:commissions.emptyLive.description")}
        />
      )}
      {posting && <PostProjectModal onClose={() => setPosting(false)} />}
    </section>
  );
}

export function ShowcaseSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [submitting, setSubmitting] = useState(false);
  return (
    <section>
      <SectionHeader
        title={
          <Translation
            i18nKey="culture:showcase.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("culture:showcase.sub")}
        action={
          <Button onClick={() => setSubmitting(true)}>
            {t("culture:showcase.submitWorkCta")}
          </Button>
        }
      />
      {demoMode ? (
        <div className={styles.galleryGrid}>
          {GALLERY.map((item) => (
            <div
              key={item.title}
              className={`${styles.galItem} ${item.featured ? styles.galFeat : ""}`}
            >
              <div
                className={styles.galBg}
                style={{ background: item.gradient }}
              >
                <item.emoji />
              </div>
              <div className={styles.galOverlay}>
                <div className={styles.goTitle}>{item.title}</div>
                <div className={styles.goArtist}>{item.artist}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FiImage />}
          title={t("culture:showcase.emptyLive.title")}
          description={t("culture:showcase.emptyLive.description")}
        />
      )}
      {submitting && <SubmitWorkModal onClose={() => setSubmitting(false)} />}
    </section>
  );
}

export function RadioIntro() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [submitting, setSubmitting] = useState(false);
  return (
    <section>
      <SectionHeader
        title={
          <Translation
            i18nKey="culture:radio.heading"
            components={{ em: <em /> }}
          />
        }
        sub={t("culture:radio.sub")}
        action={
          <Button onClick={() => setSubmitting(true)}>
            {t("culture:radio.submitPlaylistCta")}
          </Button>
        }
      />
      {!demoMode && (
        <EmptyState
          icon={<FiRadio />}
          title={t("culture:radio.emptyLive.title")}
          description={t("culture:radio.emptyLive.description")}
        />
      )}
      {submitting && (
        <SubmitPlaylistModal onClose={() => setSubmitting(false)} />
      )}
    </section>
  );
}
