import { useState } from "react";
import { FiLock } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GuidelinesLink } from "../marketing/GuidelinesLink";
import styles from "./auth.module.css";

/**
 * The guidelines consent on the request-invite form. Read-only on purpose:
 * reading the guidelines to the end is the only way to tick it.
 */
export function RequestInviteAgreeRow({
  agreed,
  onAgree,
  invalid,
}: {
  agreed: boolean;
  onAgree: () => void;
  invalid: boolean;
}) {
  const { t } = useTranslation();
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  return (
    <>
      <div className={`${styles.agreeRow} ${!agreed ? styles.locked : ""}`}>
        {/* A direct click (or Space) can't toggle this: it's controlled by
            `agreed`, which only the guidelines' confirm button flips (via
            `onRead`), so `preventDefault` blocks any manual toggle. A click
            while locked opens the guidelines, so the click always leads
            somewhere useful. */}
        <input
          id="ri-agree"
          type="checkbox"
          checked={agreed}
          readOnly
          onClick={(e) => {
            e.preventDefault();
            if (!agreed) setIsGuidelinesOpen(true);
          }}
          aria-invalid={invalid}
          aria-describedby={!agreed ? "ri-agree-hint" : undefined}
        />
        <label htmlFor="ri-agree">
          <Translation
            i18nKey="auth:requestInvite.agree"
            components={{
              guidelines: (
                <GuidelinesLink
                  onRead={onAgree}
                  isOpen={isGuidelinesOpen}
                  onOpenChange={setIsGuidelinesOpen}
                />
              ),
            }}
          />
        </label>
      </div>
      {!agreed && (
        <p id="ri-agree-hint" className={styles.readHint}>
          <FiLock aria-hidden /> {t("auth:requestInvite.readHint")}
        </p>
      )}
    </>
  );
}
