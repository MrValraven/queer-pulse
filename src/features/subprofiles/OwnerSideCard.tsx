import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  personaOwnerAddress,
  type PersonaResolvedAddress,
} from "./personaLinks.data";
import { LeavePersonaModal } from "./LeavePersonaModal";
import { SideCard } from "./SideCard";
import { SideCardFooter, type PersonaDangerAction } from "./SideCardFooter";
import {
  usePersonaCreatorSlug,
  usePersonaIsCreator,
} from "./usePersonaCreatorSlug";

/** What the dashboard needs to open the share card for one persona: the row,
 *  plus the ALREADY RESOLVED absolute URL its QR code, vCard `URL:` line and
 *  copy-link row all read. Resolved once here so the four affordances cannot
 *  drift into building four different addresses. */
export interface PersonaShareTarget {
  view: SubprofileView;
  shareUrl: string;
}

/**
 * One dashboard card, with its public address resolved from the persona's
 * CREATOR rather than the signed-in member, and its destructive action chosen
 * by whether the signed-in member is that creator.
 *
 * A co-owner sees co-owned personas in this grid too, and a linked persona
 * lives under its creator's profile. Building View / Share from the viewer's
 * own slug sent every co-owner to a not-found wall and had them share a dead
 * link, so both actions go through `usePersonaCreatorSlug` and wait for a real
 * answer rather than guessing. Delete is creator-only server-side, so a
 * co-owner gets Leave in its place (`usePersonaIsCreator`, which reuses the
 * same members query and so costs no extra request).
 */
export function OwnerSideCard({
  view,
  onShare,
  onDelete,
}: {
  view: SubprofileView;
  onShare: (target: PersonaShareTarget) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const creatorSlug = usePersonaCreatorSlug(view.id, view.memberCount);
  const isCreator = usePersonaIsCreator(view.id, view.memberCount);
  const [leaving, setLeaving] = useState(false);

  const address = personaOwnerAddress(view, creatorSlug);
  const danger: PersonaDangerAction =
    isCreator === undefined ? "unknown" : isCreator ? "delete" : "leave";

  /** View and Share both need a settled address. `"none"` never reaches here
   *  (the footer disables both controls), so this only has to cover the moment
   *  before the creator slug lands. */
  function withResolvedAddress(
    run: (resolved: PersonaResolvedAddress) => void,
  ) {
    if (address.status !== "ready") {
      showToast(t("subprofiles:share.resolvingAddress"), "info");
      return;
    }
    run(address);
  }

  return (
    <>
      <SideCard
        view={view}
        footer={
          <SideCardFooter
            address={address}
            danger={danger}
            onEdit={() => void navigate(subprofileEditPath(view.id))}
            onOpen={() =>
              withResolvedAddress((resolved) => void navigate(resolved.path))
            }
            onShare={() =>
              withResolvedAddress((resolved) =>
                onShare({ view, shareUrl: resolved.shareUrl }),
              )
            }
            onDelete={onDelete}
            onLeave={() => setLeaving(true)}
          />
        }
      />

      {leaving && (
        <LeavePersonaModal
          subprofileId={view.id}
          onClose={() => setLeaving(false)}
        />
      )}
    </>
  );
}
