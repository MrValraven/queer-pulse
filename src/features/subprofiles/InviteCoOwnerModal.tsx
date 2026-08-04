import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Modal, SearchInput, Spinner } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSocial } from "../../app/providers/useSocial";
import { reasonFor } from "../../shared/api/errorMessage";
import { initialsFromName } from "../../shared/lib/initials";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import type { ConnectionView } from "../connect/connections.data";
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
 * Search-your-connections picker for co-owner invites, reusing the same
 * connection pool + row layout as `GroupAddMembersModal` (messages) minus
 * multi-select: each row invites on its own tap, since sending an invite is
 * the whole point of opening this modal (there's nothing to "confirm" after).
 * Uses the shared `<Modal>` (owns scroll-lock/focus-trap/Escape) rather than a
 * bespoke dialog, matching the rest of this feature's modals.
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
  const [query, setQuery] = useState("");
  const [invitingSlug, setInvitingSlug] = useState<string | null>(null);

  const excluded = useMemo(() => new Set(excludedSlugs), [excludedSlugs]);

  const { views, loading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConnectionsList("all");

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const candidates = useMemo(
    () => views.filter((view) => !isBlocked(view.slug) && !excluded.has(view.slug)),
    [views, isBlocked, excluded],
  );
  const people = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return trimmed
      ? candidates.filter((view) => view.name.toLowerCase().includes(trimmed))
      : candidates;
  }, [query, candidates]);

  async function handleInvite(person: ConnectionView) {
    if (invitingSlug) return;
    setInvitingSlug(person.slug);
    try {
      await invite.mutateAsync({ slug: person.slug });
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
      <SearchInput
        className={styles.searchField}
        value={query}
        onChange={setQuery}
        placeholder={t("subprofiles:invite.searchPlaceholder")}
        ariaLabel={t("subprofiles:invite.searchAria")}
      />
      <ul className={styles.list}>
        {people.map((person) => {
          const isBusy = invitingSlug === person.slug;
          return (
            <li key={person.slug} className={styles.row}>
              <Avatar
                initials={person.initials || initialsFromName(person.name, "?")}
                tint={person.tint}
                src={person.photo}
                size={40}
              />
              <span className={styles.rowName}>{person.name}</span>
              <Button
                variant="ghost"
                size="md"
                disabled={invitingSlug !== null}
                onClick={() => void handleInvite(person)}
              >
                {isBusy ? t("subprofiles:invite.inviting") : t("subprofiles:invite.cta")}
              </Button>
            </li>
          );
        })}
        {loading && candidates.length === 0 && (
          <li className={styles.empty}>
            <Spinner />
          </li>
        )}
        {!loading && candidates.length === 0 && (
          <li className={styles.empty}>{t("subprofiles:invite.empty")}</li>
        )}
      </ul>
    </Modal>
  );
}
