import { useState } from "react";
import { FiKey } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./JoinRequestStatus.module.css";

/**
 * The recovery path: someone saved their reference code but lost the link that
 * carried it. Also the first thing a visitor sees who arrives here with nothing
 * in the query string and nothing in this browser's storage.
 */
export function JoinRequestStatusForm({
  onSubmit,
}: {
  onSubmit: (code: string) => void;
}) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  const trimmedCode = code.trim();
  const isMissing = hasAttempted && trimmedCode.length === 0;

  return (
    <div className={styles.state}>
      <div className={styles.icon}>
        <FiKey aria-hidden />
      </div>
      <p className={styles.eyebrow}>{t("auth:joinRequestStatus.eyebrow")}</p>
      <h1 className={styles.title}>
        <Translation
          i18nKey="auth:joinRequestStatus.form.title"
          components={{ em: <em /> }}
        />
      </h1>
      <p className={styles.lead}>{t("auth:joinRequestStatus.form.lead")}</p>

      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setHasAttempted(true);
          if (trimmedCode.length === 0) return;
          onSubmit(trimmedCode);
        }}
      >
        <FormField
          label={t("auth:joinRequestStatus.form.label")}
          helper={t("auth:joinRequestStatus.form.helper")}
          error={isMissing ? t("auth:joinRequestStatus.form.error") : undefined}
        >
          <input
            type="text"
            className={styles.codeInput}
            value={code}
            autoComplete="off"
            spellCheck={false}
            placeholder={t("auth:joinRequestStatus.form.placeholder")}
            onChange={(event) => setCode(event.target.value)}
          />
        </FormField>
        <div className={styles.formActions}>
          <Button type="submit">
            {t("auth:joinRequestStatus.form.submit")}
          </Button>
          <Button variant="ghost" to={routes.contact}>
            {t("auth:joinRequestStatus.contactCta")}
          </Button>
        </div>
      </form>
    </div>
  );
}
