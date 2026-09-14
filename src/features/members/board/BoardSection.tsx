import { useContext, useEffect, useMemo, useState } from "react";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { VisibilityBadge } from "../../../shared/components/ui";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useBoardInsights } from "../api/useBoardInsights";
import { StatsFunnelLine } from "../StatsFunnelLine";
import { Section } from "../ProfileSections";
import { ProfileEditBoardContext } from "../ProfileEditBoardContext";
import type { MemberProfile } from "../data/memberProfiles";
import { BoardRow } from "./BoardRow";
import { BoardFooterStrip } from "./BoardFooterStrip";
import { DEMO_BOARD_NOW_MS } from "./boardInsights.demo";
import { boardLifespan } from "./boardLifespan";
import styles from "./BoardSection.module.css";

/**
 * "On the board": what a member is asking for and offering.
 *
 * The owner gets the funnel strip, the visibility badge, reciprocal match
 * pills and the renew/repost/mark-found actions. A visitor gets the rows, the
 * lifespan meters, who offered to help, and their own respond action, and sees
 * no expired posts at all.
 */
export function BoardSection({
  profile,
  isSelf = false,
}: {
  profile: MemberProfile;
  isSelf?: boolean;
  /** Escape hatch for a future caller that renders `BoardSection` outside
   *  `ProfilePage`'s `ProfileEditBoardContext.Provider` (a standalone page, a
   *  test, a story). Every caller today — desktop read-mode and the mobile
   *  tabbed view alike — renders inside that provider, so this isn't read:
   *  the footer's "Post to board" CTA is wired from context alone. Threading
   *  the same closure in twice, once as a prop and once through context, gave
   *  two sources of truth that happened to agree only because nothing had
   *  changed either one yet. */
  onEditBoard?: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const insights = useBoardInsights(isSelf);
  // Both render paths sit inside `ProfilePage`'s `ProfileEditBoardContext`
  // (see its doc comment for why the desktop leg can't take this as a plain
  // prop), so context is the single source of truth for the footer's CTA.
  const onEditBoard = useContext(ProfileEditBoardContext);

  // Demo board posts are all dated in the past, so reading the real clock here
  // would render the whole walkthrough as "Expired quietly". Demo mode pins the
  // clock to the registry's reference date; live mode uses the real one.
  //
  // `Date.now()` is impure, so it can't be called directly during render (the
  // lint that guards this treats it as an unstable read that could disagree
  // with itself across renders). It's captured once at mount via `useState`'s
  // lazy initializer and only resynced if the demo/live toggle ("Populate
  // platform" in the account menu) flips underneath an already-mounted page —
  // it is NOT a live clock, so a profile left open across midnight keeps
  // judging expiry against its mount-time reading until the next remount or
  // toggle. That's fine: the server is authoritative on expiry regardless of
  // what this renders, and a `setInterval` here would just be work spent
  // re-deriving a label nobody is watching in real time.
  const [nowMs, setNowMs] = useState(() =>
    demoMode ? DEMO_BOARD_NOW_MS : Date.now(),
  );
  useEffect(() => {
    setNowMs(demoMode ? DEMO_BOARD_NOW_MS : Date.now());
  }, [demoMode]);

  const visible = useMemo(
    () =>
      profile.board.filter((item) =>
        isSelf ? true : !boardLifespan(item, nowMs).isExpired,
      ),
    [profile.board, isSelf, nowMs],
  );

  const counts = useMemo(() => {
    const monthStart = new Date(nowMs);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return {
      open: profile.board.filter(
        (item) =>
          item.status === "open" && !boardLifespan(item, nowMs).isExpired,
      ).length,
      found: profile.board.filter(
        (item) =>
          item.status === "closed" &&
          item.closedAt !== undefined &&
          new Date(item.closedAt).getTime() >= monthStart.getTime(),
      ).length,
    };
  }, [profile.board, nowMs]);

  if (visible.length === 0) return null;

  return (
    <Section
      id="board"
      title={
        <Translation
          i18nKey="members:content.board.titleRich"
          components={{ em: <em /> }}
        />
      }
      subtitle={t("members:content.board.subtitle", { first: profile.first })}
      aside={
        <>
          {/* Two fragments, each pluralised on its own count. One key
              carrying both numbers would pick a single plural category and
              force it onto the other word, so "1 open, 5 found" read as
              "1 aberto . 5 encontrado" in PT. */}
          <span className={styles.countPill}>
            <strong>
              {t("members:content.board.countPillOpen", {
                count: counts.open,
              })}
            </strong>
            {" · "}
            {t("members:content.board.countPillFound", {
              count: counts.found,
            })}
          </span>
          {isSelf && <VisibilityBadge mode={profile.visibility} />}
        </>
      }
    >
      {isSelf && insights.data && (
        <StatsFunnelLine
          className={styles.statsStrip}
          hellos={insights.data.hellos}
          replies={insights.data.replies}
          windowDays={insights.data.windowDays}
        />
      )}

      <div className={styles.card}>
        {visible.map((item) => (
          <BoardRow
            key={item.slug}
            item={item}
            isSelf={isSelf}
            memberSlug={profile.slug}
            memberFirst={profile.first}
            nowMs={nowMs}
            matches={insights.data?.matches[item.slug] ?? []}
          />
        ))}
        <BoardFooterStrip
          visibleCount={visible.length}
          isSelf={isSelf}
          onEditBoard={onEditBoard}
        />
      </div>
    </Section>
  );
}
