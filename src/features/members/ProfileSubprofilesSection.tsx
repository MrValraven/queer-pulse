import { FiLayers } from "react-icons/fi";
import { Button, EmptyState, Eyebrow } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useNudges } from "../../app/providers/useNudges";
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
import styles from "./ProfileSubprofilesSection.module.css";

/**
 * The main profile's "Also as…" block. Shows the owner's LINKED + published
 * personas only — the hook returns exactly those, so an unlinked (pseudonymous)
 * persona can never leak onto the public main profile (spec §4).
 *
 * The personas render as a featured-hero + switch list ({@link SubprofileShowcase})
 * that collapses into a filterable index once there are many. Public view with
 * none → renders nothing. Self view's dashboard link lives in the switch
 * list's own header ("Add another persona" — `SubprofileSwitchHeader`), so
 * this section doesn't repeat a second link to the same destination. When
 * empty, shows a gentle prompt to create one.
 */
export function ProfileSubprofilesSection({
  ownerSlug,
  isSelf,
  previewing = false,
}: {
  ownerSlug: string;
  isSelf: boolean;
  /** The owner is previewing their own profile as a visitor. `isSelf` is already
   *  `false` in that mode (so the public data path is used), but in live mode a
   *  persona's `viewerIsMember` flag stays `true` — the server never sees the
   *  client-only preview toggle — which would otherwise keep the Edit control
   *  visible. Forwarding this lets the showcase suppress owner controls so the
   *  preview truly matches the visitor experience. */
  previewing?: boolean;
}) {
  const { t } = useTranslation();
  // Rules of Hooks: both sources are called unconditionally on every render.
  // The owner query is *gated* via `enabled`, not conditionally called — a
  // visitor viewing someone else's profile (or a logged-out visitor) must
  // never hit GET /subprofiles/mine.
  const ownerQuery = useSubprofiles({ enabled: isSelf });
  const publicQuery = useProfileSubprofiles(ownerSlug);

  // Self view waits for the public list too: it is where the per-persona
  // creator slug comes from (see `creatorSlugById`), and rendering the
  // showcase before it lands would paint every co-owned persona's link with
  // the wrong member for a beat. A wrong link is worse than a moment's wait.
  const isLoading = isSelf
    ? ownerQuery.isLoading || publicQuery.isLoading
    : publicQuery.isLoading;
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

  // A linked persona is addressed by its CREATOR's profile slug, and
  // `/subprofiles/mine` returns co-owned personas too, so adapting the whole
  // owner list against the signed-in member's own slug handed every co-owned
  // persona a dead-end link (and, where the member had a persona of their own
  // under the same slug, a link to that other persona). The dashboard resolves
  // the same thing per card with `usePersonaCreatorSlug`; a list cannot call a
  // hook per row, so this reads the creator the server already resolved on the
  // public list running alongside. No extra request, and the exact value the
  // public path renders.
  //
  // Keyed by persona id: two personas on one profile can share a slug once one
  // of them was created by somebody else, which is the collision this whole
  // fix is about. A persona missing from the public list (draft, unlisted, or
  // under a takedown) keeps the viewed profile's slug, which is right for
  // every persona the member created themselves.
  const creatorSlugById = new Map<string, string>(
    publicList.flatMap((view) =>
      view.ownerSlug ? [[view.id, view.ownerSlug] as [string, string]] : [],
    ),
  );

  // Self view sees every persona (incl. drafts/unlisted) via the owner
  // query, adapted to the shared showcase shape; a visitor sees only the
  // linked + published ones the public hook already scopes to (spec §4).
  const personas = isSelf
    ? ownerList.map((view) =>
        ownerViewToShowcaseView(
          view,
          creatorSlugById.get(view.id) ?? ownerSlug,
        ),
      )
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
      <Section
        id="also-working-as"
        title={t("subprofiles:alsoAs.title")}
        subtitle={subtitle}
      >
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
            previewing={previewing}
            ownerMetaBySlug={isSelf ? ownerMetaBySlug : undefined}
          />
        ) : (
          // isSelf is guaranteed here: the early return above already sent a
          // visitor viewing an empty profile to `null`.
          <SidesPrompt />
        )}
      </Section>
    </div>
  );
}

/**
 * The self+empty "SidesPrompt" nudge (personas Phase 5, Decision §5): a
 * stronger, more inviting treatment than a neutral empty state — inviting
 * the owner to give a second craft its own persona page. Dismissible for
 * good (`nudge_key: "profile_empty"`) via the shared discovery-moment store;
 * once dismissed, or once the member has dismissed 2 other discovery
 * moments (the shared cap), it quietly degrades back to the original plain
 * `EmptyState` — still a working path to create a persona, just without the
 * nudge framing.
 */
function SidesPrompt() {
  const { t } = useTranslation();
  const { isDismissed, isCapped, dismiss } = useNudges();

  if (isDismissed("profile_empty") || isCapped) {
    return (
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
    );
  }

  return (
    <div className={styles.sidesPrompt}>
      <Eyebrow>{t("subprofiles:alsoAs.sidesPrompt.eyebrow")}</Eyebrow>
      <h3 className={styles.heading}>
        <Translation
          i18nKey="subprofiles:alsoAs.sidesPrompt.heading"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.description}>
        {t("subprofiles:alsoAs.sidesPrompt.description")}
      </p>
      <div className={styles.actions}>
        <Button variant="primary" size="sm" to={routes.subprofilesDashboard}>
          {t("subprofiles:alsoAs.sidesPrompt.cta")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dismiss("profile_empty")}
        >
          {t("subprofiles:alsoAs.sidesPrompt.notNow")}
        </Button>
      </div>
    </div>
  );
}
