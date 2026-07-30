import { FiLayers } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useProfileSubprofiles } from "../subprofiles/api/usePublicSubprofile";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import {
  ownerViewToShowcaseView,
  type SubprofileOwnerMeta,
} from "../subprofiles/api/subprofiles.adapters";
import { SubprofileShowcase } from "../subprofiles/SubprofileShowcase";
import { Section } from "./ProfileSections";

/**
 * The main profile's "Also as…" block. Shows the owner's LINKED + published
 * personas only — the hook returns exactly those, so an unlinked (pseudonymous)
 * persona can never leak onto the public main profile (spec §4).
 *
 * The personas render as a featured-hero + switch list ({@link SubprofileShowcase})
 * that collapses into a filterable index once there are many. Public view with
 * none → renders nothing. Self view's dashboard link lives in the switch
 * list's own header ("Add another side" — {@link SubprofileSwitchHeader}), so
 * this section doesn't repeat a second link to the same destination. When
 * empty, shows a gentle prompt to create one.
 */
export function ProfileSubprofilesSection({
  ownerSlug,
  isSelf,
}: {
  ownerSlug: string;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  // Rules of Hooks: both sources are called unconditionally on every render.
  // The owner query is *gated* via `enabled`, not conditionally called — a
  // visitor viewing someone else's profile (or a logged-out visitor) must
  // never hit GET /subprofiles/mine.
  const ownerQuery = useSubprofiles({ enabled: isSelf });
  const publicQuery = useProfileSubprofiles(ownerSlug);

  const isLoading = isSelf ? ownerQuery.isLoading : publicQuery.isLoading;
  const ownerList = ownerQuery.data ?? [];
  const publicList = publicQuery.data ?? [];

  // Owner-only fields (status/visibility/position/id) don't exist on
  // `PublicSubprofileView` — kept as a separate per-slug map rather than
  // merged into the shared view model (see `SubprofileOwnerMeta`).
  const ownerMetaBySlug = new Map<string, SubprofileOwnerMeta>(
    ownerList.map((view) => [
      view.slug,
      {
        id: view.id,
        status: view.status,
        visibility: view.visibility,
        position: view.position,
      },
    ]),
  );

  // Self view sees every persona (incl. drafts/unlisted) via the owner
  // query, adapted to the shared showcase shape; a visitor sees only the
  // linked + published ones the public hook already scopes to (spec §4).
  const personas = isSelf
    ? ownerList.map((view) => ownerViewToShowcaseView(view, ownerSlug))
    : publicList;
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
          <SubprofileShowcase
            // Resets all per-owner state (activeSlug, previousIndexRef,
            // seenSlugs) when navigating between different profiles —
            // without this the showcase would carry a stale selection
            // from the last profile viewed.
            key={ownerSlug}
            personas={personas}
            ownerSlug={ownerSlug}
            isSelf={isSelf}
            ownerMetaBySlug={isSelf ? ownerMetaBySlug : undefined}
          />
        ) : (
          <EmptyState
            compact
            icon={<FiLayers />}
            title={
              <Translation
                i18nKey="subprofiles:alsoAs.empty.title"
                components={{ em: <em /> }}
              />
            }
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
