import { useContext } from "react";
import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { QuizshowStudioContext } from "../studio/QuizshowStudioContext";

/**
 * The language quiz text reads in: the studio's view language inside the
 * studio, else the app language (a picker opened outside the studio, a test).
 * It reads the context directly, so it never throws outside the provider.
 */
export function useQuizshowViewLanguage(): QuizshowLanguage {
  const { language } = useTranslation();
  return useContext(QuizshowStudioContext)?.viewLanguage ?? language;
}
