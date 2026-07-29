import { Link } from "react-router-dom";
import { FiLayers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileSubprofiles } from "../subprofiles/api/usePublicSubprofile";
import { SubprofileShowcase } from "../subprofiles/SubprofileShowcase";
import { Section } from "./ProfileSections";
import styles from "./ProfileSubprofilesSection.module.css";

/**
 * The main profile's "Also as…" block. Shows the owner's LINKED + published
 * personas only — the hook returns exactly those, so an unlinked (pseudonymous)
 * persona can never leak onto the public main profile (spec §4).
 *
 * The personas render as a featured-hero + switch list ({@link SubprofileShowcase})
 * that collapses into a filterable index once there are many. Public view with
 * none → renders nothing. Self view adds a "Manage subprofiles" link, and when
 * empty shows a gentle prompt to create one.
 */
export function ProfileSubprofilesSection({
  ownerSlug,
  isSelf,
}: {
  ownerSlug: string;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useProfileSubprofiles(ownerSlug);
  const personas = data ?? [];
  const hasPersonas = personas.length > 0;

  // While loading, or on a public profile with nothing to show, render nothing.
  if (isLoading) return null;
  if (!isSelf && !hasPersonas) return null;

  const subtitle = !hasPersonas
    ? t("subprofiles:alsoAs.subtitleEmpty")
    : isSelf
      ? t("subprofiles:alsoAs.subtitleSelf")
      : t("subprofiles:alsoAs.subtitlePublic");

  return (
    <div className="wrap">
      <Section title={t("subprofiles:alsoAs.title")} subtitle={subtitle}>
        {hasPersonas ? (
          <>
            <SubprofileShowcase personas={personas} ownerSlug={ownerSlug} />
            {isSelf && (
              <Link className={styles.manage} to={routes.subprofilesDashboard}>
                {t("subprofiles:alsoAs.manage")}
              </Link>
            )}
          </>
        ) : (
          <EmptyState
            compact
            icon={<FiLayers />}
            title={t("subprofiles:alsoAs.empty.title")}
            description={t("subprofiles:alsoAs.empty.description")}
            action={{
              label: t("subprofiles:alsoAs.empty.cta"),
              to: routes.subprofilesDashboard,
            }}
          />
        )}
      </Section>
    </div>
  );
}
