import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, CheckLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityRulesList } from "./CommunityRulesList";
import styles from "./JoinModal.module.css";

/**
 * The house-rules step of the join wizard.
 *
 * A support space's covenant used to be reachable only from the About tab,
 * which meant someone could join and post without ever having been shown it.
 * The wizard now puts the rules on the way in, with an explicit acknowledgement
 * that gates the rest of the flow. The version the applicant agreed to is sent
 * with the join, so the backend records consent to this exact text.
 *
 * `isUpdated` covers the one race worth handling: an owner edited the rules
 * while this modal was open, the join came back with
 * `RULES_ACCEPTANCE_REQUIRED`, and the applicant is brought back here to read
 * the new version rather than being handed a generic failure.
 */
export function JoinRulesStep({
  name,
  rules,
  isUpdated,
  isAcknowledged,
  setIsAcknowledged,
  onContinue,
}: {
  name: string;
  rules: string[];
  isUpdated: boolean;
  isAcknowledged: boolean;
  setIsAcknowledged: (isAcknowledged: boolean) => void;
  onContinue: () => void;
}) {
  const { t } = useTranslation();
  // Shown only after a continue attempt with the box unticked. The button
  // stays enabled so the requirement is discoverable by keyboard and screen
  // reader instead of silently dead.
  const [hasTriedWithoutAck, setHasTriedWithoutAck] = useState(false);

  const handleContinue = () => {
    if (!isAcknowledged) {
      setHasTriedWithoutAck(true);
      return;
    }
    onContinue();
  };

  return (
    <div>
      <div className={styles.eye}>{t("communities:join.rules.eyebrow")}</div>
      <div className={styles.title}>
        {t("communities:join.rules.title", { name })}
      </div>
      {isUpdated && (
        <p className={styles.notice} role="status">
          <FiAlertCircle aria-hidden />{" "}
          {t("communities:join.rules.updatedNotice")}
        </p>
      )}
      <p className={styles.hint}>{t("communities:join.rules.hint")}</p>

      <CommunityRulesList rules={rules} />

      <div className={styles.ack}>
        <CheckLine
          checked={isAcknowledged}
          onChange={(checked) => {
            setIsAcknowledged(checked);
            if (checked) setHasTriedWithoutAck(false);
          }}
          title={t("communities:join.rules.acknowledge.title")}
          sub={t("communities:join.rules.acknowledge.sub")}
        />
      </div>

      <Button variant="primary" onClick={handleContinue}>
        {t("communities:join.rules.continueCta")}
      </Button>
      {hasTriedWithoutAck && !isAcknowledged && (
        <p className={styles.error} role="alert">
          {t("communities:join.rules.acknowledgeRequired")}
        </p>
      )}
    </div>
  );
}
