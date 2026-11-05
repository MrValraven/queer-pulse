import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/Button";
import type { QuizshowErrorCode } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  isJoinCodeShaped,
  normaliseJoinCode,
  quizshowPlayPath,
} from "../quizshowPaths";
import {
  QUIZSHOW_CODE_CELL_COUNT,
  QuizshowCodeCells,
} from "./QuizshowCodeCells";
import styles from "./QuizshowPlay.module.css";

interface QuizshowCodeFormProps {
  initialErrorCode: QuizshowErrorCode | null;
  /** The last join failed with no known code, so the generic copy shows. */
  hasUnknownFailure?: boolean;
}

export function QuizshowCodeForm({
  initialErrorCode,
  hasUnknownFailure = false,
}: QuizshowCodeFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [typedCode, setTypedCode] = useState("");
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [errorKey, setErrorKey] = useState<string | null>(
    initialErrorCode !== null || hasUnknownFailure
      ? quizshowErrorKeyOf(initialErrorCode)
      : null,
  );

  function refuse(nextErrorKey: string) {
    setErrorKey(nextErrorKey);
    setSubmitAttempt((attempt) => attempt + 1);
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (typedCode.length < QUIZSHOW_CODE_CELL_COUNT) {
      refuse("quizshow:player.codeIncomplete");
      return;
    }
    if (!isJoinCodeShaped(typedCode)) {
      refuse(quizshowErrorKeyOf("quizshow_join_code_not_found"));
      return;
    }
    setErrorKey(null);
    void navigate(quizshowPlayPath(normaliseJoinCode(typedCode)));
  }

  return (
    <form className={styles.codeForm} onSubmit={submitCode} noValidate>
      <h1 className={styles.title}>{t("quizshow:player.codeTitle")}</h1>
      <QuizshowCodeCells
        value={typedCode}
        errorText={errorKey === null ? undefined : t(errorKey)}
        submitAttempt={submitAttempt}
        onChange={(nextCode) => {
          setTypedCode(nextCode);
          setErrorKey(null);
        }}
      />
      <Button type="submit" variant="stage" size="lg">
        {t("quizshow:player.codeSubmit")}
      </Button>
    </form>
  );
}
