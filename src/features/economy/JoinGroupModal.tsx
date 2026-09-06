import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { ModalShell, Sending, SuccessPanel } from "./ModalKit";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSubmitGroupJoinRequest } from "./api/useSubmitGroupJoinRequest";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import type { VettedGroup } from "./housingGroups.data";
import styles from "./ApplicationModals.module.css";

export function JoinGroupModal({
  group,
  onClose,
}: {
  group: VettedGroup;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const joinRequest = useSubmitGroupJoinRequest();
  const groupName = `${group.name}${group.nameEm ? ` ${group.nameEm}` : ""}`;
  const done = joinRequest.isSuccess;

  const requiredAnswered = group.screeningQuestions
    .filter((question) => question.required)
    .every((question) => (answers[question.id] ?? "").trim().length > 0);
  const valid =
    name.trim().length > 1 &&
    relationship.trim().length > 1 &&
    requiredAnswered;

  const handleSubmit = () => {
    if (!valid) return;
    joinRequest.mutate(
      {
        slug: group.id,
        name: name.trim(),
        relationship: relationship.trim(),
        answers: group.screeningQuestions
          .map((question) => ({
            questionId: question.id,
            answer: (answers[question.id] ?? "").trim(),
          }))
          .filter((entry) => entry.answer.length > 0),
      },
      {
        onError: (error) => {
          if (handlePledgeError(error, handleSubmit)) return;
          showToast(t("economy:joinGroup.error"), "error");
        },
      },
    );
  };

  if (pledgeGate) return pledgeGate;

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:joinGroup.ariaLabel", { name: groupName })}
    >
      {done ? (
        <SuccessPanel
          title={
            <Translation
              i18nKey="economy:joinGroup.success.title"
              components={{ em: <em /> }}
            />
          }
          onClose={onClose}
          closeLabel={t("economy:joinGroup.success.closeLabel")}
          // PRD-242. Says where the answer will show up. Without it the panel
          // was the last thing anyone ever heard about the application.
          footer={
            <p className={styles.successNote}>
              {t("economy:joinGroup.success.whereToCheck")}
            </p>
          }
        >
          <Translation
            i18nKey="economy:joinGroup.success.body"
            components={{ strong: <strong /> }}
            values={{ name: groupName }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>{t("economy:joinGroup.eyebrow")}</div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:joinGroup.title"
              components={{ em: <em /> }}
              values={{ name: groupName }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:joinGroup.sub")}</p>

          <div className={styles.field}>
            <label htmlFor="jg-name">{t("economy:joinGroup.nameLabel")}</label>
            <input
              id="jg-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("economy:joinGroup.namePlaceholder")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="jg-relationship">
              {t("economy:joinGroup.relationshipLabel")}
            </label>
            <textarea
              id="jg-relationship"
              rows={3}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder={t("economy:joinGroup.relationshipPlaceholder")}
            />
          </div>
          {group.screeningQuestions.map((question) => (
            <div className={styles.field} key={question.id}>
              <label htmlFor={`jg-${question.id}`}>
                {question.prompt}
                {!question.required && (
                  <span> {t("economy:joinGroup.optional")}</span>
                )}
              </label>
              <textarea
                id={`jg-${question.id}`}
                rows={2}
                value={answers[question.id] ?? ""}
                onChange={(event) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <p className={styles.note}>{t("economy:joinGroup.disclaimer")}</p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:joinGroup.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || joinRequest.isPending}
              onClick={handleSubmit}
            >
              {joinRequest.isPending ? (
                <Sending label={t("economy:joinGroup.sending")} />
              ) : (
                t("economy:joinGroup.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
