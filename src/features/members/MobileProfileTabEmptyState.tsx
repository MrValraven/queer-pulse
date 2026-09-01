import { FiInbox } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";

/**
 * The fallback shown inside a mobile profile tab whose sections all rendered
 * nothing. Rendered unconditionally as the last child of `.tabPanel`; a
 * `:has()` rule in `MobileProfile.module.css` hides it the moment any real
 * section renders content, so nothing here has to re-derive the eight
 * sections' individual emptiness rules (which would be a second copy free to
 * drift) or predict the two async-sourced ones a sync gate can't see.
 *
 * `isSelf` is the effective `selfView` (`isSelf && !previewing`), so an owner
 * previewing as a visitor gets the visitor copy and no editor CTA — the same
 * gate every section in `MobileProfileTabPanels` already uses.
 */
export function MobileProfileTabEmptyState({
  isSelf,
  firstName,
}: {
  isSelf: boolean;
  firstName: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="wrap" data-tab-empty>
      <EmptyState
        compact
        icon={<FiInbox />}
        title={t("members:profile.tabs.empty.title")}
        description={
          isSelf
            ? t("members:profile.tabs.empty.descriptionSelf")
            : t("members:profile.tabs.empty.descriptionPublic", {
                first: firstName,
              })
        }
        action={
          isSelf
            ? {
                label: t("members:profile.tabs.empty.cta"),
                to: routes.editProfile,
              }
            : undefined
        }
      />
    </div>
  );
}
