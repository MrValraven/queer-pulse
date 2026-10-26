import { useId, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiUsers } from "react-icons/fi";
import {
  Button,
  ChipList,
  Collapse,
  CollapseListItem,
  LoadErrorState,
  RefineGroup,
  RefineNote,
  SearchInput,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useHiddenEventCommunities } from "../api/useHiddenEventCommunities";
import { useHiddenEventCommunityActions } from "../api/useHiddenEventCommunityActions";
import { useHideableCommunitySearch } from "./useHideableCommunitySearch";
import styles from "./HiddenCommunitiesRefineGroup.module.css";

/** A live hide shows its row under this id prefix until the server answers
 *  with the real id (`placeholderRowFor`). Unhiding it before then would send
 *  the placeholder id, so the row waits. */
const PLACEHOLDER_ID_PREFIX = "pending-";

function isPlaceholderId(communityId: string): boolean {
  return communityId.startsWith(PLACEHOLDER_ID_PREFIX);
}

/**
 * The Browse drawer's last band: the communities whose events the member
 * hides, as removable chips, and a name search to hide another.
 *
 * It is a standing preference that outlasts any search, so the Refine badge
 * and the active-filter chips leave it out. Hiding and unhiding go through the
 * shared actions hook, which updates the lists optimistically and toasts the
 * result with an Undo.
 */
export function HiddenCommunitiesRefineGroup({
  searchInputRef,
}: {
  /** The search field, so the Browse notice's "Manage" can focus it. */
  searchInputRef: RefObject<HTMLInputElement | null>;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const [searchTerm, setSearchTerm] = useState("");
  const {
    communities,
    isError: isHiddenListError,
    refetch: refetchHiddenList,
  } = useHiddenEventCommunities();
  const { unhide, isPending } = useHiddenEventCommunityActions();
  const isSearching = searchTerm.trim() !== "";
  const isChipSaving = (community: (typeof communities)[number]) =>
    isPending(community.slug) || isPlaceholderId(community.communityId);

  return (
    <RefineGroup
      label={t("gatherings:hiddenCommunities.refine.label")}
      labelId={labelId}
      role="group"
      aria-labelledby={labelId}
    >
      {/* `data-hidden-communities-band` is what the Browse notice's "Manage"
          scrolls into view. */}
      <div className={styles.stack} data-hidden-communities-band="">
        <RefineNote>{t("gatherings:hiddenCommunities.refine.note")}</RefineNote>
        {/* The list failed to load while the server still filters by it, so
            the empty chip row would mislead: say so and offer a retry. */}
        <Collapse isOpen={isHiddenListError}>
          <LoadErrorState
            compact
            title={t("settings:hiddenCommunities.empty.error.title")}
            description={t("settings:hiddenCommunities.empty.error.desc")}
            onRetry={refetchHiddenList}
          />
        </Collapse>
        <ChipList
          items={communities}
          // The slug, because a live hide shows a placeholder row until the
          // server answers with the real id, and the chip must stay put.
          getKey={(community) => community.slug}
          renderLabel={(community) => (
            <span
              className={styles.chipLabel}
              data-saving={isChipSaving(community) || undefined}
            >
              {community.name}
            </span>
          )}
          removeLabel={(community) =>
            t("gatherings:hiddenCommunities.refine.unhideLabel", {
              name: community.name,
            })
          }
          onRemove={(community) => {
            if (isChipSaving(community)) return;
            unhide({
              id: community.communityId,
              slug: community.slug,
              name: community.name,
            });
          }}
          emptyFocusRef={searchInputRef}
        />
        <SearchInput
          className={styles.search}
          inputRef={searchInputRef}
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t(
            "gatherings:hiddenCommunities.refine.searchPlaceholder",
          )}
          ariaLabel={t("gatherings:hiddenCommunities.refine.searchLabel")}
        />
        <Collapse isOpen={isSearching}>
          <HideableCommunityResults searchTerm={searchTerm} />
        </Collapse>
      </div>
    </RefineGroup>
  );
}

/**
 * What the open search shows: a failed load first (an outage must not read
 * as "no community has that name"), then the matches, each offering Hide or
 * Unhide by whether the member already hides it, or the no-match line once
 * the answer for the typed term is in.
 */
function HideableCommunityResults({ searchTerm }: { searchTerm: string }) {
  const { t } = useTranslation();
  const { matches, isAwaiting, isError, refetch } =
    useHideableCommunitySearch(searchTerm);
  const { communities, hiddenSlugs } = useHiddenEventCommunities();
  const { hide, unhide, isPending } = useHiddenEventCommunityActions();
  const placeholderSlugs = new Set(
    communities
      .filter((community) => isPlaceholderId(community.communityId))
      .map((community) => community.slug),
  );
  const isNoMatch = !isError && !isAwaiting && matches.length === 0;

  return (
    <div className={styles.results}>
      <Collapse isOpen={isError}>
        <LoadErrorState
          compact
          description={t("gatherings:hiddenCommunities.refine.searchError")}
          onRetry={refetch}
        />
      </Collapse>
      <Collapse isOpen={isNoMatch}>
        <p role="status" className={styles.noMatch}>
          {t("gatherings:hiddenCommunities.refine.noMatch")}
        </p>
      </Collapse>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {(isError ? [] : matches).map((community) => {
            const isHidden = hiddenSlugs.has(community.slug);
            const isSaving =
              isPending(community.slug) || placeholderSlugs.has(community.slug);
            return (
              <CollapseListItem key={community.slug}>
                <div className={styles.row}>
                  <CommunityAvatar avatarImageUrl={community.avatarImageUrl} />
                  <span className={styles.name}>{community.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    // `aria-disabled` keeps focus on the button while the
                    // change saves; a real `disabled` would drop it to the page.
                    aria-disabled={isSaving || undefined}
                    aria-label={t(
                      isHidden
                        ? "gatherings:hiddenCommunities.refine.unhideLabel"
                        : "gatherings:hiddenCommunities.menu.hide",
                      { name: community.name },
                    )}
                    onClick={() => {
                      if (isSaving) return;
                      if (isHidden) {
                        unhide({ slug: community.slug, name: community.name });
                        return;
                      }
                      hide({
                        slug: community.slug,
                        name: community.name,
                        avatarImageUrl: community.avatarImageUrl,
                      });
                    }}
                  >
                    {t(
                      isHidden
                        ? "gatherings:hiddenCommunities.refine.unhideCta"
                        : "gatherings:hiddenCommunities.refine.hideCta",
                    )}
                  </Button>
                </div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/** The community's own avatar, or a quiet people tile when it has none. */
function CommunityAvatar({
  avatarImageUrl,
}: {
  avatarImageUrl: string | null;
}) {
  if (avatarImageUrl) {
    return (
      <img
        className={styles.avatar}
        src={avatarImageUrl}
        alt=""
        width={28}
        height={28}
        loading="lazy"
      />
    );
  }
  return (
    <span className={styles.avatarFallback} aria-hidden>
      <FiUsers />
    </span>
  );
}
