import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminNotice } from "../ui";
import {
  culturalErrorKeyOf,
  culturalErrorValuesOf,
} from "./culturalProductionErrors";

const CULTURAL_NAMESPACE_PREFIX = "admin:culturalProduction.";

/** A key as the catalog reads it. A caller may pass the full key
 *  ("admin:culturalProduction.tasks.loadError.title"), the key in the admin
 *  namespace ("culturalProduction.tasks.loadError.title") or the key under
 *  the feature ("tasks.loadError.title"); all three read the same line. */
function culturalCatalogKeyOf(key: string): string {
  if (key.includes(":")) return key;
  if (key.startsWith("culturalProduction.")) return `admin:${key}`;
  return `${CULTURAL_NAMESPACE_PREFIX}${key}`;
}

/**
 * A list, a drawer or a page that failed to load: the title names what
 * failed, the body names the cause (the connection, the server, the
 * account's access or the reason code), and the retry names what it loads.
 * While the retry runs the button stays in place, says so and ignores
 * presses. Built on `AdminNotice tone="error"`, the `AdminLeadLoadError`
 * shape.
 */
export function CulturalLoadError({
  error,
  isRetrying,
  onRetry,
  titleKey,
  retryKey,
}: {
  error: unknown;
  isRetrying: boolean;
  onRetry: () => void;
  titleKey: string;
  retryKey: string;
}) {
  const { t } = useTranslation();
  return (
    <AdminNotice
      tone="error"
      title={t(culturalCatalogKeyOf(titleKey))}
      action={
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={isRetrying || undefined}
          onClick={() => {
            if (!isRetrying) onRetry();
          }}
        >
          {isRetrying
            ? t("shared:loadError.retryingCta")
            : t(culturalCatalogKeyOf(retryKey))}
        </Button>
      }
    >
      {t(culturalErrorKeyOf(error), culturalErrorValuesOf(error))}
    </AdminNotice>
  );
}
