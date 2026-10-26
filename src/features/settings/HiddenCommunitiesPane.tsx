import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import { FiEyeOff, FiUsers } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  EmptyState,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { HiddenEventCommunityDTO } from "../gatherings/api/hiddenEventCommunities.api";
import { useHiddenEventCommunities } from "../gatherings/api/useHiddenEventCommunities";
import { useHiddenEventCommunityActions } from "../gatherings/api/useHiddenEventCommunityActions";
import { Pane, Section } from "./SettingsControls";
import styles from "./HiddenCommunitiesPane.module.css";

/** Prefix of the stand-in id `placeholderRowFor` gives an unsaved hide. */
const PLACEHOLDER_ID_PREFIX = "pending-";

/** Mirrors a row so the list does not shift when it loads. */
function HiddenCommunitySkeleton() {
  return (
    <div className={styles.skeletonRow}>
      <SkeletonAvatar size={40} />
      <div className={styles.body}>
        <SkeletonLine width="45%" height={16} />
        <SkeletonLine width="30%" height={12} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={88} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

/**
 * The unhide button of the nearest row that is staying, next one first. A row
 * on its way out is `inert`, so it is skipped. Null when no other row is left.
 */
function neighbourUnhideButton(from: HTMLElement): HTMLButtonElement | null {
  const row = from.closest("li");
  const candidates = [row?.nextElementSibling, row?.previousElementSibling];
  for (const candidate of candidates) {
    if (candidate instanceof HTMLElement && !candidate.inert) {
      // A disabled button (a row still saving) cannot take focus.
      const button = candidate.querySelector<HTMLButtonElement>(
        "button:not(:disabled)",
      );
      if (button) return button;
    }
  }
  return null;
}

/** The stand-in row the actions hook shows until a live hide is saved. */
function isPlaceholderRow(community: HiddenEventCommunityDTO): boolean {
  return community.communityId.startsWith(PLACEHOLDER_ID_PREFIX);
}

function HiddenCommunityRow({
  community,
  isActing,
  onUnhide,
}: {
  community: HiddenEventCommunityDTO;
  isActing: boolean;
  onUnhide: (button: HTMLButtonElement) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.rowSlot}>
      <div className={styles.row}>
        {community.avatarImageUrl ? (
          <img
            className={styles.avatar}
            src={community.avatarImageUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            <FiUsers />
          </span>
        )}
        <div className={styles.body}>
          <p className={styles.name}>{community.name}</p>
          <p className={styles.meta}>
            {t("settings:hiddenCommunities.row.hiddenOn", {
              date: fmt.date(new Date(community.hiddenAt)),
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          className={styles.action}
          disabled={isActing}
          aria-label={t("settings:hiddenCommunities.row.unhideLabel", {
            name: community.name,
          })}
          onClick={(event) => onUnhide(event.currentTarget)}
        >
          {t("settings:hiddenCommunities.row.unhideCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The communities whose events the member hid from Highlights, Browse and the
 * calendar, each with one way back. Unhiding is optimistic in the actions hook,
 * so the row folds away at once and the hook restores it on failure.
 */
function HiddenCommunitiesSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { communities, isLoading, isError, refetch } =
    useHiddenEventCommunities();
  const { unhide, isPending } = useHiddenEventCommunityActions();
  const isSimulatedLoading = useSimulatedLoad();
  // Demo keeps its simulated shimmer; live shows the real fetch state.
  const isShowingSkeleton = demoMode ? isSimulatedLoading : isLoading;
  const listRef = useRef<HTMLUListElement>(null);

  /** `Section` renders its label as the first child of the element holding
   *  this list, so the section heading is the list's first sibling. */
  function focusSectionHeading() {
    const list = listRef.current;
    const heading = list?.parentElement?.firstElementChild;
    if (heading instanceof HTMLElement && heading !== list) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }

  function handleUnhide(
    community: HiddenEventCommunityDTO,
    button: HTMLButtonElement,
  ) {
    // A hide still in flight shows a stand-in row whose id is no uuid yet, so
    // unhiding it would only send a request the server refuses.
    if (isPlaceholderRow(community)) return;
    // The pressed button is about to leave with its row (inert while it
    // folds), so focus moves now, before the removal: to a row that stays,
    // or to the section heading, which never leaves, when this was the last.
    const nextButton = neighbourUnhideButton(button);
    if (nextButton) nextButton.focus();
    else focusSectionHeading();
    unhide({
      id: community.communityId,
      slug: community.slug,
      name: community.name,
    });
  }

  if (isShowingSkeleton) {
    return (
      <Section label={t("settings:hiddenCommunities.section")}>
        <div className={styles.skeletonList}>
          <HiddenCommunitySkeleton />
          <HiddenCommunitySkeleton />
        </div>
      </Section>
    );
  }

  if (isError && communities.length === 0) {
    return (
      <Section label={t("settings:hiddenCommunities.section")}>
        <LoadErrorState
          compact
          onRetry={refetch}
          title={t("settings:hiddenCommunities.empty.error.title")}
          description={t("settings:hiddenCommunities.empty.error.desc")}
        />
      </Section>
    );
  }

  return (
    <Section label={t("settings:hiddenCommunities.section")}>
      <ul ref={listRef} className={styles.list}>
        <AnimatePresence initial={false}>
          {/* Keyed by slug: a live hide shows a stand-in row that swaps to
              the saved id, and the slug keeps it the same row throughout. */}
          {communities.map((community) => (
            <CollapseListItem key={community.slug}>
              <HiddenCommunityRow
                community={community}
                isActing={
                  isPending(community.slug) || isPlaceholderRow(community)
                }
                onUnhide={(button) => handleUnhide(community, button)}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={communities.length === 0}>
        <EmptyState
          compact
          icon={<FiEyeOff />}
          title={t("settings:hiddenCommunities.empty.none.title")}
          description={t("settings:hiddenCommunities.empty.none.desc")}
        />
      </Collapse>
    </Section>
  );
}

export function HiddenCommunitiesPane() {
  const { t } = useTranslation();
  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:hiddenCommunities.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:hiddenCommunities.sub")}
    >
      <HiddenCommunitiesSection />
    </Pane>
  );
}
