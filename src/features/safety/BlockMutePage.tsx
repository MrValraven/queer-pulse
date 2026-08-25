import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Footer } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { useSocial } from "../../app/providers/useSocial";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMemberProfile } from "../members/api/useMemberProfile";
import {
  DEMO_BLOCK_MUTE_TARGET,
  type BlockMuteState,
  type BlockMuteTarget,
  type MuteDurationId,
} from "./blockMute.data";
import {
  BlockMuteBlocked,
  BlockMuteChoose,
  BlockMuteExplainer,
  BlockMuteMuted,
} from "./BlockMuteScreens";
import { QuickExit } from "./QuickExit";
import s from "./flows.module.css";

/** Capitalise a slug fragment into a readable name while the real member loads. */
function nameFromSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BlockMutePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { demoMode } = useDemoMode();
  const { isMuted, isBlocked, toggleMute, toggleBlock } = useSocial();

  // A real target may arrive via ?member=<slug> or navigation state; without one
  // the page is the generic, purely-local explainer it has always been.
  const stateSlug = (location.state as { memberSlug?: string } | null)
    ?.memberSlug;
  const targetSlug = searchParams.get("member") ?? stateSlug ?? null;
  const hasTarget = Boolean(targetSlug);

  // Without a real target there is nothing live to act on, so live mode must not
  // narrate a fake block/mute against a fictional persona. Show the honest,
  // non-transactional explainer instead; demo mode keeps the illustrative walk.
  const showLiveExplainer = !hasTarget && !demoMode;

  const { data } = useMemberProfile(targetSlug ?? undefined);
  const targetMember = data?.member ?? null;

  const target: BlockMuteTarget = targetMember
    ? {
        firstName: targetMember.first,
        fullName: `${targetMember.first} ${targetMember.last}`,
        initials: targetMember.initials,
        meta: [targetMember.pronouns, targetMember.hood]
          .filter(Boolean)
          .join(" · "),
      }
    : hasTarget
      ? {
          firstName: nameFromSlug(targetSlug!),
          fullName: nameFromSlug(targetSlug!),
          initials: nameFromSlug(targetSlug!).slice(0, 2).toUpperCase(),
          meta: "",
        }
      : DEMO_BLOCK_MUTE_TARGET;

  // Timed mutes are demo-only: the live backend's POST /mutes/:slug takes no
  // duration, so when acting on a real member in live mode we offer only the
  // untilUnmute effect and never pretend a timed mute persisted.
  const timedMuteAllowed = !hasTarget || demoMode;

  const [state, setState] = useState<BlockMuteState>("choose");
  const [chosen, setChosen] = useState<"mute" | "block" | null>(null);
  const [muteDur, setMuteDur] = useState<MuteDurationId>("untilUnmute");
  const effectiveMuteDur: MuteDurationId = timedMuteAllowed
    ? muteDur
    : "untilUnmute";
  const pageTitle = t("safety:blockMute.meta.title");
  const pageDescription = t("safety:blockMute.meta.description");

  function handleContinue() {
    if (chosen === "mute") {
      // With a real target, drive the live-capable primitive instead of dead
      // local state. Guard on current status so re-entering the flow for an
      // already-muted member doesn't accidentally toggle them back on.
      if (hasTarget && targetSlug && !isMuted(targetSlug))
        toggleMute(targetSlug);
      setState("muted");
    } else {
      if (hasTarget && targetSlug && !isBlocked(targetSlug))
        toggleBlock(targetSlug);
      setState("blocked");
    }
  }

  function handleUndoMute() {
    if (hasTarget && targetSlug && isMuted(targetSlug)) toggleMute(targetSlug);
    setState("choose");
  }

  function handleUndoBlock() {
    if (hasTarget && targetSlug && isBlocked(targetSlug))
      toggleBlock(targetSlug);
    setState("choose");
  }

  return (
    <>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: routes.resources },
          { name: pageTitle, path: routes.blockMute },
        ])}
      />
      <div className={s.page}>
        {showLiveExplainer ? (
          <BlockMuteExplainer />
        ) : (
          <>
            {state === "choose" && (
              <BlockMuteChoose
                target={target}
                timedMuteAllowed={timedMuteAllowed}
                chosen={chosen}
                onChoose={setChosen}
                muteDur={muteDur}
                onMuteDur={setMuteDur}
                onContinue={handleContinue}
                onCancel={() => void navigate(-1)}
              />
            )}

            {state === "muted" && (
              <BlockMuteMuted
                target={target}
                muteDur={effectiveMuteDur}
                onUndo={handleUndoMute}
              />
            )}

            {state === "blocked" && (
              <BlockMuteBlocked target={target} onUndo={handleUndoBlock} />
            )}
          </>
        )}
      </div>
      <QuickExit />
      <Footer />
    </>
  );
}
