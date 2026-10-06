import { FiAward } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { EmptyState } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { FUNDING_EMPTY_COPY_KEYS } from "./funding.data";
import type { FundingWireView } from "./funding.types";

export interface FundingEmptyStateProps {
  /** The Funding & Grants view that came back empty. */
  view: FundingWireView;
  /** An eligibility or scope filter narrows the view, so clearing it is the
   *  likeliest way back to a list. */
  hasFilters: boolean;
  onClearFilters: () => void;
  onSeeAll: () => void;
}

/**
 * What an empty Funding & Grants view says: copy written for that view, a way
 * back to a fuller list (clear the filters, or every funding post), and an
 * invitation to share a call.
 */
export function FundingEmptyState({
  view,
  hasFilters,
  onClearFilters,
  onSeeAll,
}: FundingEmptyStateProps) {
  const { t } = useTranslation();
  const copyKeys = FUNDING_EMPTY_COPY_KEYS[view];
  return (
    <EmptyState
      icon={<FiAward />}
      title={t(copyKeys.titleKey)}
      description={t(copyKeys.bodyKey)}
      action={
        hasFilters
          ? {
              label: t("forum:funding.empty.clearFilters"),
              onClick: onClearFilters,
            }
          : { label: t("forum:funding.empty.seeAll"), onClick: onSeeAll }
      }
      secondaryAction={{
        label: t("forum:funding.empty.postCall"),
        to: routes.forumNew,
      }}
    />
  );
}
