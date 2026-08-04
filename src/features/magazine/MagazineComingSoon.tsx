import { FiBookOpen } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";

interface MagazineComingSoonProps {
  /** Override the title key (IssuePage uses an issue-specific string). */
  titleKey?: string;
  /** Override the description key. */
  descriptionKey?: string;
}

/**
 * The honest "no published issue yet" empty state shown in live mode across the
 * magazine surfaces (stories, sections, issue). The whole magazine front is
 * fabricated editorial content that only exists in demo mode, so live mode
 * shows this with the submit-a-story CTA as the escape hatch. Callers keep
 * their own wrapper markup around it.
 */
export function MagazineComingSoon({
  titleKey = "magazine:sections.emptyLive.title",
  descriptionKey = "magazine:sections.emptyLive.description",
}: MagazineComingSoonProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiBookOpen />}
      title={t(titleKey)}
      description={t(descriptionKey)}
      action={{
        label: t("magazine:sections.submit.cta"),
        to: routes.submitStory,
      }}
    />
  );
}
