import { useState } from "react";
import { FiInfo, FiShield } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminDrawer, AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { chipKey, chipLabel, type Appeal } from "./adminModeration.data";
import { useOriginalReport } from "./api/useOriginalReport";
import {
  AppealDecisionSection,
  type AppealDecision as Decision,
} from "./AdminAppealSections";
import styles from "./AdminModerationPage.module.css";

/**
 * The ORIGINAL reported content behind this appeal (COM-11) — not just the
 * moderator's self-reported reason for their decision, but what was actually
 * reported. Three states: loading, resolved (real excerpt + author), or
 * unavailable (a cold appeal with no linked report, or a fetch that came back
 * empty) — the last one says so plainly rather than silently omitting the
 * section, since "nothing to show" and "we didn't try" read very differently
 * to a moderator deciding an appeal.
 */
function OriginalReportedContent({
  reportId,
}: {
  reportId: string | undefined;
}) {
  const { t } = useTranslation();
  const { detail, loading } = useOriginalReport(reportId);

  if (loading) {
    return (
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.originalContentTitle")}
        </h3>
        <SkeletonLine height={14} width="40%" />
        <SkeletonLine height={48} style={{ marginTop: 12, borderRadius: 10 }} />
      </section>
    );
  }

  if (!detail) {
    return (
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.originalContentTitle")}
        </h3>
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden />{" "}
          {t("admin:moderation.appealDrawer.originalContentUnavailable")}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.dSec}>
      <h3 className={styles.dSecLabel}>
        {t("admin:moderation.appealDrawer.originalContentTitle")}
      </h3>
      <p className={styles.dContentAuthor}>{detail.contentAuthor}</p>
      <blockquote className={styles.dExcerpt}>{detail.excerpt}</blockquote>
      {detail.redactionNote && (
        <p className={styles.dRedact}>
          <FiShield aria-hidden /> {detail.redactionNote}
        </p>
      )}
    </section>
  );
}

export function AdminAppealDrawer({
  appeal,
  onClose,
  onResolve,
}: {
  appeal: Appeal;
  onClose: () => void;
  onResolve: (id: string, decision: Decision, note?: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");

  const handleRecord = () => {
    if (!decision) {
      showToast(t("admin:moderation.appealDrawer.chooseToast"), "error");
      return;
    }
    if (!reason.trim()) {
      showToast(
        t("admin:moderation.appealDrawer.reasonRequiredToast"),
        "error",
      );
      return;
    }
    onResolve(appeal.id, decision, reason.trim());
    onClose();
  };

  return (
    <AdminDrawer
      label={t("admin:moderation.appealDrawer.label", {
        name: appeal.appealBy,
      })}
      onClose={onClose}
      head={
        <>
          <div className={styles.dHeadChips}>
            {appeal.chips.map((chip) => (
              <AdminChip key={chipKey(chip)} tone={chip.tone}>
                {chipLabel(chip, t)}
              </AdminChip>
            ))}
          </div>
          <h2 className={styles.dTitle}>{appeal.title}</h2>
          <div className={styles.appealBy}>
            <AdminAvatar
              initials={appeal.initials}
              tone={appeal.tone}
              size="sm"
              src={portrait(appeal.appealBy)}
            />
            <span>
              {appeal.appealBy}
              <span className={styles.dPersonPronoun}>{appeal.pronoun}</span>
              {appeal.community && (
                <span className={styles.dPersonPronoun}>
                  · {appeal.community}
                </span>
              )}
            </span>
          </div>
        </>
      }
      foot={
        <div className={styles.dFoot}>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:moderation.appealDrawer.cancelCta")}
          </Button>
          <Button variant="primary" onClick={handleRecord}>
            {t("admin:moderation.appealDrawer.recordCta")}
          </Button>
        </div>
      }
    >
      {/* Original decision */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.originalTitle")}
        </h3>
        <div className={styles.appealOrig}>
          <div className={styles.appealOrigTop}>
            <AdminCat tone={appeal.original.category}>
              {appeal.original.action}
            </AdminCat>
            <span className={styles.appealOrigBy}>
              {t("admin:moderation.appealDrawer.decidedByLine", {
                name: appeal.original.by,
                when: appeal.original.when,
              })}
            </span>
          </div>
          <p className={styles.appealOrigReason}>{appeal.original.reason}</p>
        </div>
      </section>

      {/* Original REPORTED content (COM-11) — what was actually reported, not
          just the moderator's own reason for their decision. */}
      <OriginalReportedContent reportId={appeal.reportId} />

      {/* Member argument */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.argumentTitle")}
        </h3>
        <blockquote className={styles.appealArg}>{appeal.argument}</blockquote>
      </section>

      {/* Supporters */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.supportersTitle")}
        </h3>
        {appeal.supporters.length > 0 ? (
          <div className={styles.appealSupporters}>
            {appeal.supporters.map((s) => (
              <span key={s.name} className={styles.appealSupporter}>
                <AdminAvatar
                  initials={s.initials}
                  tone={s.tone}
                  size="sm"
                  src={portrait(s.name)}
                />
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.appealNoSupport}>
            {t("admin:moderation.appealDrawer.noSupport")}
          </p>
        )}
      </section>

      <AppealDecisionSection
        decision={decision}
        onDecide={setDecision}
        reason={reason}
        onReason={setReason}
        originalBy={appeal.original.by}
      />
    </AdminDrawer>
  );
}
