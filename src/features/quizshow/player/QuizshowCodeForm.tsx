import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import { FormField } from "../../../shared/components/ui/FormField";
import type { QuizshowErrorCode } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  isJoinCodeShaped,
  normaliseJoinCode,
  quizshowPlayPath,
} from "../quizshowPaths";
import styles from "./QuizshowPlay.module.css";

interface QuizshowCodeFormProps {
  initialErrorCode: QuizshowErrorCode | null;
  /** The last join failed with no known code, so the generic copy shows. */
  hasUnknownFailure?: boolean;
}

/** `ABCDEF` plus room for the spaces or hyphens people type between the halves. */
const CODE_INPUT_MAX_LENGTH = 9;

export function QuizshowCodeForm({
  initialErrorCode,
  hasUnknownFailure = false,
}: QuizshowCodeFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [typedCode, setTypedCode] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(
    initialErrorCode !== null || hasUnknownFailure
      ? quizshowErrorKeyOf(initialErrorCode)
      : null,
  );

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isJoinCodeShaped(typedCode)) {
      setErrorKey(quizshowErrorKeyOf("quizshow_join_code_not_found"));
      return;
    }
    setErrorKey(null);
    void navigate(quizshowPlayPath(normaliseJoinCode(typedCode)));
  }

  return (
    <form className={styles.form} onSubmit={submitCode} noValidate>
      <h1 className={styles.title}>{t("quizshow:player.codeTitle")}</h1>
      <FormField
        label={t("quizshow:player.codeLabel")}
        helper={t("quizshow:player.codeHint")}
        error={errorKey === null ? undefined : t(errorKey)}
      >
        <input
          className={styles.codeInput}
          type="text"
          value={typedCode}
          maxLength={CODE_INPUT_MAX_LENGTH}
          autoCapitalize="characters"
          autoComplete="one-time-code"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="go"
          onChange={(event) => {
            setTypedCode(event.target.value);
            setErrorKey(null);
          }}
        />
      </FormField>
      <Button type="submit" size="lg">
        {t("quizshow:player.codeSubmit")}
      </Button>
    </form>
  );
}
