import { FiAlertCircle } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";

interface MagazineLoadErrorProps {
  /** Re-runs the failed query — wire it to react-query's `refetch`. */
  onRetry: () => void;
  className?: string;
}

/**
 * The shared "we couldn't load this" panel for magazine reading surfaces
 * (article, deck, author). It is deliberately distinct from the not-found
 * wall: a 404 means the piece does not exist, while this means the request
 * failed and is worth trying again (FE-CNT-08). Pages render it with
 * `<PageMeta noIndex>` so a crawler never indexes an outage.
 */
export function MagazineLoadError({
  onRetry,
  className,
}: MagazineLoadErrorProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      className={className}
      icon={<FiAlertCircle />}
      title={t("magazine:load.errorTitle")}
      description={t("magazine:load.errorBody")}
      action={{ label: t("magazine:load.retryCta"), onClick: onRetry }}
      secondaryAction={{
        label: t("magazine:load.backCta"),
        to: routes.magazine,
      }}
    />
  );
}
