import { useRef, useState, type RefObject } from "react";
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
 * the new version, with a notice saying the rules changed.
 */
export function JoinRulesStep({
  headingRef,
  name,
  rules,
  isUpdated,
  isAcknowledged,
  setIsAcknowledged,
  onContinue,
  parentName,
}: {
  /** The heading ref `JoinModal` focuses when the step changes. */
  headingRef: RefObject<HTMLHeadingElement | null>;
  name: string;
  rules: string[];
  isUpdated: boolean;
  isAcknowledged: boolean;
  setIsAcknowledged: (isAcknowledged: boolean) => void;
  onContinue: () => void;
  /** Set when joining a space (subcommunity): the parent community's name.
   *  Shown as a note above the rules list, since a space's own rules are only
   *  the additions on top of the parent's, which the applicant already
   *  agreed to when they joined the parent. */
  parentName?: string;
}) {
  const { t } = useTranslation();
  // Shown only after a continue attempt with the box unticked. The button
  // stays enabled so a keyboard or screen-reader user can discover the
  // requirement by pressing it.
  const [hasTriedWithoutAck, setHasTriedWithoutAck] = useState(false);
  // Wraps the acknowledgement. `CheckLine` takes no ref, so a failed continue
  // reaches its button through this wrapper: focusing it scrolls the box and
  // the line beneath it into view on a phone, where both can sit below the
  // fold under a long list of rules.
  const ackRef = useRef<HTMLDivElement>(null);

  const handleContinue = () => {
    if (!isAcknowledged) {
      setHasTriedWithoutAck(true);
      ackRef.current?.querySelector("button")?.focus();
      return;
    }
    onContinue();
  };

  return (
    <div>
      <div className={styles.eye}>{t("communities:join.rules.eyebrow")}</div>
      <h2 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t("communities:join.rules.title", { name })}
      </h2>
      {isUpdated && (
        <p className={styles.notice} role="status">
          <FiAlertCircle aria-hidden />{" "}
          {t("communities:join.rules.updatedNotice")}
        </p>
      )}
      <p className={styles.hint}>{t("communities:join.rules.hint")}</p>
      {parentName && (
        <p className={styles.hint}>
          {t("communities:spaces.join.rulesNote", { name: parentName })}
        </p>
      )}

      <CommunityRulesList rules={rules} />

      <div className={styles.ack} ref={ackRef}>
        <CheckLine
          checked={isAcknowledged}
          onChange={(checked) => {
            setIsAcknowledged(checked);
            if (checked) setHasTriedWithoutAck(false);
          }}
          title={t("communities:join.rules.acknowledge.title")}
          sub={t("communities:join.rules.acknowledge.sub")}
        />
        {hasTriedWithoutAck && !isAcknowledged && (
          <p className={styles.error} role="alert">
            {t("communities:join.rules.acknowledgeRequired")}
          </p>
        )}
      </div>

      <Button variant="primary" onClick={handleContinue}>
        {t("communities:join.rules.continueCta")}
      </Button>
    </div>
  );
}
