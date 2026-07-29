import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminDrawer, AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { chipKey, chipLabel, type Appeal } from "./adminModeration.data";
import {
  AppealDecisionSection,
  type AppealDecision as Decision,
} from "./AdminAppealSections";
import styles from "./AdminModerationPage.module.css";

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
          <Link className={styles.appealOrigLink} to={routes.adminModeration}>
            {t("admin:moderation.appealDrawer.viewOriginalCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </section>

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
