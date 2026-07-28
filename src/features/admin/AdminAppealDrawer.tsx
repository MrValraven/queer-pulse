import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck, FiRotateCcw, FiInfo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminDrawer, AdminChip, AdminCat, AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { chipKey, chipLabel, type Appeal } from "./adminModeration.data";
import styles from "./AdminModerationPage.module.css";

type Decision = "uphold" | "overturn";

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

      {/* Decision */}
      <section className={styles.dSec}>
        <h3 className={styles.dSecLabel}>
          {t("admin:moderation.appealDrawer.decisionTitle")}
        </h3>
        <div
          className={styles.appealDecision}
          role="radiogroup"
          aria-label={t("admin:moderation.appealDrawer.decisionAriaLabel")}
        >
          <button
            type="button"
            aria-pressed={decision === "uphold"}
            className={[
              styles.decOption,
              decision === "uphold" && styles.decUpholdOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setDecision("uphold")}
          >
            <span className={styles.decIco} aria-hidden>
              <FiCheck />
            </span>
            <span className={styles.decTx}>
              <span className={styles.decTitle}>
                {t("admin:moderation.appealDrawer.uphold")}
              </span>
              <span className={styles.decSub}>
                {t("admin:moderation.appealDrawer.upholdSub")}
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={decision === "overturn"}
            className={[
              styles.decOption,
              decision === "overturn" && styles.decOverturnOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setDecision("overturn")}
          >
            <span className={styles.decIco} aria-hidden>
              <FiRotateCcw />
            </span>
            <span className={styles.decTx}>
              <span className={styles.decTitle}>
                {t("admin:moderation.appealDrawer.overturn")}
              </span>
              <span className={styles.decSub}>
                {t("admin:moderation.appealDrawer.overturnSub")}
              </span>
            </span>
          </button>
        </div>

        <textarea
          aria-label={t("admin:moderation.appealDrawer.reasonAriaLabel")}
          className={styles.dNote}
          rows={3}
          placeholder={t("admin:moderation.appealDrawer.reasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <p className={styles.dTransparency}>
          <FiInfo aria-hidden />{" "}
          {t("admin:moderation.appealDrawer.transparency", {
            name: appeal.original.by,
          })}
        </p>
      </section>
    </AdminDrawer>
  );
}
