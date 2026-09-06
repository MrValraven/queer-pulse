import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * PRD-110 / CON-16: the language the reader is reading the MAGAZINE in.
 *
 * `?lang=` wins so a shared link keeps whatever language it was shared in, and
 * the chrome language is the fallback so a member who has set the interface to
 * Portuguese gets Portuguese journalism without asking twice. This is the same
 * resolution `ArticlePage` already applies before calling `useArticle`; it
 * lives here so every list hook (front, search, tag browse, section browse,
 * author) sends the SAME `lang` the article read sends, instead of browsing
 * English headlines and only switching language after the click.
 */
export function useReaderLanguage(): string {
  const [searchParams] = useSearchParams();
  const { language } = useTranslation();
  return searchParams.get("lang") ?? language;
}
