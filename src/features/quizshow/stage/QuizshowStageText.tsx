import type {
  QuizshowScreenLanguage,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import styles from "./QuizshowStageText.module.css";
import {
  pickQuizshowTextWithLanguage,
  primaryLanguageOf,
} from "./quizshowText";

export interface QuizshowStageTextProps {
  text: QuizshowText;
  /** 'both': the EN line, then the PT line smaller and muted (C6.26). */
  language: QuizshowScreenLanguage;
  /** The element that holds the text. Defaults to "span". */
  as?: "span" | "p" | "h2" | "h3";
  className?: string;
  /** Styles the PT line under 'both'; without it the line reads smaller in --qs-text-mute. */
  secondaryClassName?: string;
}

/**
 * One quiz text on the stage, in an element whose `lang` is the language the
 * words are actually in (item 41). With `language: "both"` it renders the EN
 * line and then the PT line, each with its own `lang`; when the two match, or
 * one side is blank, it renders one line.
 */
export function QuizshowStageText({
  text,
  language,
  as: Element = "span",
  className,
  secondaryClassName,
}: QuizshowStageTextProps) {
  const englishText = text.en.trim();
  const portugueseText = text.pt.trim();
  const isTwoLines =
    language === "both" &&
    englishText !== "" &&
    portugueseText !== "" &&
    englishText !== portugueseText;

  if (!isTwoLines) {
    const picked = pickQuizshowTextWithLanguage(
      text,
      primaryLanguageOf(language),
    );
    return (
      <Element className={className} lang={picked.language}>
        {picked.text}
      </Element>
    );
  }

  return (
    <Element className={className}>
      <span lang="en" className={styles.line}>
        {text.en}
      </span>
      <span
        lang="pt"
        className={[styles.line, secondaryClassName ?? styles.secondary]
          .filter(Boolean)
          .join(" ")}
      >
        {text.pt}
      </span>
    </Element>
  );
}
