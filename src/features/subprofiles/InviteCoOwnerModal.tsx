import { useMemo, useState } from "react";
import { FiEyeOff, FiShield } from "react-icons/fi";
import {
  Button,
  MemberIdentity,
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
import type { SubprofileView } from "./api/subprofiles.adapters";
import { useSubprofileInvites } from "./api/useSubprofileInvites";
import styles from "./InviteCoOwnerModal.module.css";

/** The picker (step 1) never shows a row as selected — tapping a row opens
 *  the disclosure/confirm step (step 2) rather than inviting immediately, so
 *  `MemberSelectList` always renders with nothing selected. One shared
 *  instance avoids recreating an empty `Set` on every render. */
const EMPTY_SELECTION = new Set<string>();

interface InviteCoOwnerModalProps {
  /** The full persona, not just its id — the confirm step reads
   *  `linkVisibility` to decide whether the invitee sees the stronger
   *  identity-reveal disclosure (Unlinked personas only). */
  subprofile: SubprofileView;
  /** Slugs to leave off the picker — current members plus anyone already
   *  pending, so the owner can't double-invite someone. */
  excludedSlugs: string[];
  onClose: () => void;
}

/**
 * Search-your-connections picker for co-owner invites, now a two-step flow:
 * pick someone from {@link MemberSelectList} (the SearchInput + member-row
 * pattern shared by the new-message, new-group, add-members and
 * invite-co-owner flows), then confirm on a disclosure step before the invite
 * actually sends. The disclosure exists because co-owner access has no
 * restricted tier — accepting grants full, unrestricted management of the
 * persona — and because for an Unlinked (pseudonymous) persona, accepting
 * also reveals the creator's real account identity to the new co-owner. Both
 * facts are easy to miss and hard to undo, so the confirm step gates Send on
 * an explicit acknowledgment checkbox rather than firing on the first tap
 * (IDN-2). Uses the shared `<Modal>` (owns scroll-lock/focus-trap/Escape)
 * rather than a bespoke dialog, matching the rest of this feature's modals.
 */
export function InviteCoOwnerModal({
  subprofile,
  excludedSlugs,
  onClose,
}: InviteCoOwnerModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { isBlocked } = useSocial();
  const { invite } = useSubprofileInvites(subprofile.id);
  const [invitingSlug, setInvitingSlug] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] =
    useState<MemberSelectPerson | null>(null);
  const [disclosureAcknowledged, setDisclosureAcknowledged] = useState(false);

  const isUnlinkedPersona = subprofile.linkVisibility === "unlinked";

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

  // Picking a row (step 1) no longer sends the invite on its own — it opens
  // the disclosure/confirm step instead, so the picker never needs to show a
  // row as "selected" the way a single-tap-to-invite list would.
  function handleSelectPerson(slug: string) {
    const person = people.find((candidate) => candidate.slug === slug);
    if (!person) return;
    setSelectedPerson(person);
    setDisclosureAcknowledged(false);
  }

  function handleBackToPicker() {
    setSelectedPerson(null);
    setDisclosureAcknowledged(false);
  }

  async function handleConfirmInvite() {
    if (!selectedPerson || invitingSlug) return;
    setInvitingSlug(selectedPerson.slug);
    try {
      await invite.mutateAsync({ slug: selectedPerson.slug });
      showToast(t("subprofiles:invite.toastSent"), "success");
      onClose();
    } catch (error) {
      showToast(
        reasonFor(error) ?? t("subprofiles:invite.toastError"),
        "error",
      );
      setInvitingSlug(null);
    }
  }

  return (
    <Modal
      title={
        selectedPerson
          ? t("subprofiles:invite.confirmTitle")
          : t("subprofiles:invite.title")
      }
      sub={selectedPerson ? undefined : t("subprofiles:invite.sub")}
      onClose={onClose}
      footer={
        selectedPerson ? (
          <>
            <Button
              variant="ghost"
              onClick={handleBackToPicker}
              disabled={invitingSlug !== null}
            >
              {t("subprofiles:invite.confirmBack")}
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleConfirmInvite()}
              disabled={!disclosureAcknowledged || invitingSlug !== null}
            >
              {invitingSlug
                ? t("subprofiles:invite.inviting")
                : t("subprofiles:invite.confirmSend")}
            </Button>
          </>
        ) : undefined
      }
    >
      {selectedPerson ? (
        <div className={styles.confirm}>
          <div className={styles.selectedPerson}>
            <MemberIdentity
              person={selectedPerson}
              secondary={selectedPerson.pronouns}
            />
          </div>

          <div className="notice warn">
            <FiShield size={20} aria-hidden />
            <div className="warnbody">
              <b>{t("subprofiles:invite.disclosureAccessTitle")}</b>
              <p>
                {t("subprofiles:invite.disclosureAccessBody", {
                  name: selectedPerson.name,
                })}
              </p>
            </div>
          </div>

          {isUnlinkedPersona && (
            <div className="notice warn">
              <FiEyeOff size={20} aria-hidden />
              <div className="warnbody">
                <b>{t("subprofiles:invite.disclosureIdentityTitle")}</b>
                <p>
                  {t("subprofiles:invite.disclosureIdentityBody", {
                    name: selectedPerson.name,
                  })}
                </p>
              </div>
            </div>
          )}

          <label
            className={styles.acknowledgeRow}
            htmlFor="invite-co-owner-disclosure-acknowledge"
          >
            <input
              id="invite-co-owner-disclosure-acknowledge"
              type="checkbox"
              checked={disclosureAcknowledged}
              onChange={(event) =>
                setDisclosureAcknowledged(event.target.checked)
              }
            />
            <span>
              {t(
                isUnlinkedPersona
                  ? "subprofiles:invite.acknowledgeUnlinked"
                  : "subprofiles:invite.acknowledgeLinked",
                { name: selectedPerson.name },
              )}
            </span>
          </label>
        </div>
      ) : loading && people.length === 0 ? (
        <div className={styles.empty}>
          <Spinner />
        </div>
      ) : people.length === 0 ? (
        <p className={styles.empty}>{t("subprofiles:invite.empty")}</p>
      ) : (
        <>
          <MemberSelectList
            people={people}
            selected={EMPTY_SELECTION}
            onToggle={handleSelectPerson}
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
