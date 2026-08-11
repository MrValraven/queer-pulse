import { useMemo, useState } from "react";
import {
  Button,
  MemberSelectList,
  Modal,
  Spinner,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { reasonFor } from "../../shared/api/errorMessage";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { useSubprofileInvites } from "./api/useSubprofileInvites";
import styles from "./InviteCoOwnerModal.module.css";

interface InviteCoOwnerModalProps {
  subprofileId: string;
  /** Slugs to leave off the picker — current members plus anyone already
   *  pending, so the owner can't double-invite someone. */
  excludedSlugs: string[];
  onClose: () => void;
}

/**
 * Search-your-connections picker for co-owner invites. Reuses the shared
 * {@link MemberSelectList} (the SearchInput + member-row pattern shared by the
 * new-message, new-group, add-members and invite-co-owner flows) in
 * single-select mode: each row invites on its own tap, since sending an invite
 * is the whole point of opening this modal (there's nothing to "confirm"
 * after). Uses the shared `<Modal>` (owns scroll-lock/focus-trap/Escape)
 * rather than a bespoke dialog, matching the rest of this feature's modals.
 */
export function InviteCoOwnerModal({
  subprofileId,
  excludedSlugs,
  onClose,
}: InviteCoOwnerModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked } = useSocial();
  const { invite } = useSubprofileInvites(subprofileId);
  const [invitingSlug, setInvitingSlug] = useState<string | null>(null);

  const excluded = useMemo(() => new Set(excludedSlugs), [excludedSlugs]);

  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      views
        .filter((view) => !isBlocked(view.slug) && !excluded.has(view.slug))
        .map((view) => ({
          slug: view.slug,
          name: view.name,
          avatarUrl: view.photo,
          pronouns: view.pron,
        })),
    [views, isBlocked, excluded],
  );

  // A single-item set so the row being invited reads as selected while its
  // request is in flight (the modal closes on success, so this is transient).
  const selected = useMemo(
    () => new Set(invitingSlug ? [invitingSlug] : []),
    [invitingSlug],
  );

  async function handleInvite(slug: string) {
    if (invitingSlug) return;
    setInvitingSlug(slug);
    try {
      await invite.mutateAsync({ slug });
      showToast(t("subprofiles:invite.toastSent"), "success");
      onClose();
    } catch (error) {
      showToast(reasonFor(error) ?? t("subprofiles:invite.toastError"), "error");
      setInvitingSlug(null);
    }
  }

  return (
    <Modal
      title={t("subprofiles:invite.title")}
      sub={t("subprofiles:invite.sub")}
      onClose={onClose}
    >
      {loading && people.length === 0 ? (
        <div className={styles.empty}>
          <Spinner />
        </div>
      ) : people.length === 0 ? (
        <p className={styles.empty}>{t("subprofiles:invite.empty")}</p>
      ) : (
        <>
          <MemberSelectList
            people={people}
            selected={selected}
            onToggle={(slug) => void handleInvite(slug)}
            multiSelect={false}
            searchPlaceholder={t("subprofiles:invite.searchPlaceholder")}
          />
          {/* Pages load ON DEMAND now, not all-at-once on mount. NOTE: the
              picker's search only matches connections already loaded — a member
              with many connections may need to load more before a far-down name
              appears. A server-side connections search (?q=) would be the proper
              fix; deliberately NOT built here (no new endpoint). */}
          {hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? t("subprofiles:invite.loadingMore")
                  : t("subprofiles:invite.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
