import type { ReactNode } from "react";
import {
  FiCheck,
  FiEdit2,
  FiEye,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileEndorse } from "./SubprofileEndorse";
import { SubprofileFollow } from "./SubprofileFollow";
import { SubprofileMoreMenu } from "./SubprofileMoreMenu";
import { SubprofileShare } from "./SubprofileShare";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import { personaAddressName } from "./subprofile-kinds";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * Static, disabled look-alike for a preview-mode action — same icon/label
 * shape as the real control, no handler wired (the Phase-3 editor preview
 * renders a truthful shape of the page without triggering real mutations).
 */
function InertAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Button type="button" variant="ghost" size="md" disabled>
      {icon} {label}
    </Button>
  );
}

/**
 * The `.pp-acts` action row — what a viewer can *do* about this persona,
 * shaped by `mode`. `onAction` is the page host's dispatch (`SubprofilePage`,
 * Task 5): `"report"` opens `SubprofileReportModal`, and the controls that
 * already have real, self-contained behaviour (follow/endorse/share/message)
 * keep using their own hooks directly rather than routing through it.
 * `preview` mode (the Phase-3 editor) and `visitor` mode (the owner reading
 * their own page as a stranger, entered from the `View as visitor` control in
 * the owner row) mount no mutating widgets at all — only inert look-alikes —
 * so neither ever fires a real follow/endorse/API call. They share this branch
 * because the action row is the one place where both want the same answer:
 * show the visitor's controls, don't let them do anything.
 */
export function SubprofileHeroActions({
  view,
  mode,
  onAction,
}: {
  view: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}) {
  const { t } = useTranslation();
  const { contact } = useMemberContact(view.ownerSlug ?? "");
  const accent = view.accent ?? DEFAULT_ACCENT;
  const ctaHref = safeHref(view.ctaUrl);
  const hasCta = Boolean(ctaHref && view.ctaLabel);
  const canMessage =
    view.linkVisibility === "linked" && Boolean(view.ownerSlug);

  if (mode === "owner") {
    return (
      <div className="pp-acts">
        <Button
          variant="primary"
          size="md"
          to={subprofileEditPath(view.id)}
          onClick={() => onAction("edit")}
        >
          <FiEdit2 aria-hidden /> {t("subprofiles:hero.edit")}
        </Button>
        {/* Only a published persona has a visitor to be viewed as: a draft
            answers 404 for everyone but its owner, so offering the preview
            there would promise a page nobody can actually reach. The draft
            banner above already says so. */}
        {view.status === "published" && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => onAction("preview:enter")}
          >
            <FiEye aria-hidden /> {t("subprofiles:hero.viewAsVisitor")}
          </Button>
        )}
        <SubprofileShare view={view} />
        <SubprofileAvailability value={view.availability} accent={accent} />
      </div>
    );
  }

  if (mode === "preview" || mode === "visitor") {
    return (
      <div className="pp-acts">
        {view.ctaLabel && (
          <Button type="button" variant="primary" size="md" disabled>
            {view.ctaLabel}
          </Button>
        )}
        {canMessage && (
          <InertAction icon={null} label={t("subprofiles:hero.message")} />
        )}
        <InertAction
          icon={
            view.viewerFollowing ? (
              <FiUserCheck aria-hidden />
            ) : (
              <FiUserPlus aria-hidden />
            )
          }
          label={t(
            view.viewerFollowing
              ? "subprofiles:hero.follow.following"
              : "subprofiles:hero.follow.cta",
          )}
        />
        <InertAction
          icon={view.viewerEndorsed ? <FiCheck aria-hidden /> : null}
          label={t(
            view.viewerEndorsed
              ? "subprofiles:hero.endorse.endorsed"
              : "subprofiles:hero.endorse.cta",
          )}
        />
        {/* A stranger gets the overflow menu, so the owner previewing as one
            gets it too — with Share live (sharing your own persona is exactly
            what a visitor would do) and Report inert, since there is nobody to
            report yourself to. The editor's docked pane mounts no menu at
            all: it is a thumbnail, not the page. */}
        {mode === "visitor" && (
          <SubprofileMoreMenu view={view} onAction={onAction} inertReport />
        )}
        <SubprofileAvailability value={view.availability} accent={accent} />
      </div>
    );
  }

  // mode === "public"
  return (
    <div className="pp-acts">
      {ctaHref && view.ctaLabel && (
        <Button
          variant="primary"
          size="md"
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onAction("cta")}
        >
          {view.ctaLabel}
        </Button>
      )}
      {canMessage && (
        <Button
          variant={hasCta ? "ghost" : "primary"}
          size="md"
          onClick={() => {
            onAction("message");
            contact({
              slug: view.ownerSlug ?? "",
              name: view.ownerName ?? view.displayName,
            });
          }}
        >
          {t("subprofiles:hero.message")}
        </Button>
      )}
      <SubprofileFollow
        subprofileId={view.id}
        followerCount={view.followerCount}
        viewerFollowing={view.viewerFollowing}
        isOwnerViewing={false}
      />
      <SubprofileEndorse
        subprofileId={view.id}
        endorsementCount={view.endorsementCount}
        viewerEndorsed={view.viewerEndorsed}
        isOwnerViewing={false}
        personaName={personaAddressName({
          displayName: view.displayName,
          kind: view.kind,
          ownerName: view.ownerName,
        })}
        personaAvatarUrl={view.avatarUrl}
      />
      <SubprofileMoreMenu view={view} onAction={onAction} />
      <SubprofileAvailability value={view.availability} accent={accent} />
    </div>
  );
}
