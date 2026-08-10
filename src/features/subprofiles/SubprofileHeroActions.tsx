import type { ReactNode } from "react";
import { FiCheck, FiEdit2, FiFlag, FiShare2, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { safeHref } from "../../shared/lib/safeHref";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import { useMemberContact } from "../connect/useMemberContact";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileEndorse } from "./SubprofileEndorse";
import { SubprofileFollow } from "./SubprofileFollow";
import { SubprofileShare } from "./SubprofileShare";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * Static, disabled look-alike for a preview-mode action — same icon/label
 * shape as the real control, no handler wired (the Phase-3 editor preview
 * renders a truthful shape of the page without triggering real mutations).
 */
function InertAction({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
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
 * `preview` mode (the Phase-3 editor) mounts no mutating widgets at all —
 * only inert look-alikes — so previewing a draft never fires a real
 * follow/endorse/API call.
 */
export function SubprofileHeroActions({
  view,
  mode,
  onAction,
}: {
  view: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: string) => void;
}) {
  const { t } = useTranslation();
  const { contact } = useMemberContact(view.ownerSlug ?? "");
  const accent = view.accent ?? DEFAULT_ACCENT;
  const ctaHref = safeHref(view.ctaUrl);
  const canMessage = view.linkVisibility === "linked" && Boolean(view.ownerSlug);

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
        <SubprofileShare view={view} />
        <SubprofileAvailability value={view.availability} accent={accent} />
      </div>
    );
  }

  if (mode === "preview") {
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
          icon={view.viewerFollowing ? <FiUserCheck aria-hidden /> : <FiUserPlus aria-hidden />}
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
        <InertAction icon={<FiShare2 aria-hidden />} label={t("subprofiles:share.cta")} />
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
          variant="ghost"
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
      />
      <SubprofileShare view={view} />
      <Button
        variant="ghost"
        size="md"
        onClick={() => onAction("report")}
        aria-label={t("subprofiles:hero.report.ariaLabel", {
          name: view.displayName,
        })}
      >
        <FiFlag aria-hidden /> {t("subprofiles:hero.report.cta")}
      </Button>
      <SubprofileAvailability value={view.availability} accent={accent} />
    </div>
  );
}
