import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { InviteMembersListFooter } from "./InviteMembersListFooter";
import { InviteMembersSelectedCount } from "./InviteMembersSelectedCount";
import { useInviteMembers } from "./api/useEventMutations";
import styles from "./ManageCohosts.module.css";

/** Backend cap: at most 100 slugs per invite call. */
const MAX_INVITES = 100;

export function InviteMembersModal({
  slug,
  /** Slugs already going or already invited, hidden from the pool. */
  excludeSlugs = [],
  onClose,
}: {
  slug: string;
  excludeSlugs?: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const staffMap = useStaffMap();
  const inviteMembers = useInviteMembers(slug);
  // Everyone picked at any point in this modal, keyed by slug and kept on
  // untick, so a pinned row unticked under another search can be ticked again
  // even though the current results no longer hold that person.
  const [everPickedPeople, setEverPickedPeople] = useState<
    Map<string, MemberSelectPerson>
  >(() => new Map());
  // The slugs ticked right now, in the order they were picked.
  const [pickedSlugs, setPickedSlugs] = useState<Set<string>>(() => new Set());
  // The picks that still count: anyone the parent now excludes (say a going
  // list refetched with them on it) drops out of the count, the pinned rows
  // and the send payload alike.
  const activePicks = useMemo(() => {
    const excluded = new Set(excludeSlugs);
    return [...pickedSlugs].flatMap((pickedSlug) => {
      const person = everPickedPeople.get(pickedSlug);
      return person && !excluded.has(pickedSlug) ? [person] : [];
    });
  }, [pickedSlugs, everPickedPeople, excludeSlugs]);
  const selected = useMemo(
    () => new Set(activePicks.map((person) => person.slug)),
    [activePicks],
  );
  // Held from the moment of sending, so the success panel keeps the number
  // that went out even if the exclusions change behind it.
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Who a host can invite: their own accepted connections. The search runs
  // on the server across every page, in demo mode too, since
  // `useConnectionsList` serves and searches the demo connections itself. A
  // pick made under an earlier search stays pinned above the results and is
  // sent with the rest.
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      connections.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
        staffRole: staffMap[connection.slug]?.tier ?? undefined,
        staffBadgedRoles: staffMap[connection.slug]?.badgedStaffRoles,
      })),
    [connections, staffMap],
  );

  const toggle = (memberSlug: string) => {
    if (selected.has(memberSlug)) {
      setPickedSlugs((previous) => {
        const next = new Set(previous);
        next.delete(memberSlug);
        return next;
      });
      return;
    }
    // The current rows first, then anyone picked earlier in this modal.
    const person =
      people.find((candidate) => candidate.slug === memberSlug) ??
      everPickedPeople.get(memberSlug);
    if (!person || selected.size >= MAX_INVITES) return;
    setEverPickedPeople((previous) =>
      new Map(previous).set(memberSlug, person),
    );
    setPickedSlugs((previous) => new Set(previous).add(memberSlug));
  };

  const send = () => {
    if (selected.size === 0) return;
    // Demo → no-op mutation, optimistic UI here. Live → fires the POST + invalidate.
    inviteMembers.mutate([...selected]);
    setSentCount(selected.size);
    showToast(
      t("gatherings:manage.invite.sentToast", { count: selected.size }),
      "success",
    );
  };

  if (sentCount !== null) {
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:manage.invite.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="gatherings:manage.invite.successSub"
            values={{ count: sentCount }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.invite.successMeta", {
          count: sentCount,
        })}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:manage.invite.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:manage.invite.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:manage.invite.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={send}
            disabled={selected.size === 0}
          >
            {selected.size === 0 ? (
              t("gatherings:manage.invite.sendDefaultCta")
            ) : (
              // One span keeps the sentence a single flex item in the button.
              <span>
                <Translation
                  i18nKey="gatherings:manage.invite.sendCta"
                  values={{ count: selected.size }}
                  slots={{
                    count: (
                      <RollingNumber
                        value={fmt.number(selected.size)}
                        numericValue={selected.size}
                      />
                    ),
                  }}
                />
              </span>
            )}
          </Button>
        </>
      }
    >
      <MemberSelectList
        people={people}
        selected={selected}
        pinnedPeople={activePicks}
        onToggle={toggle}
        cap={MAX_INVITES}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:manage.invite.searchLabel")}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearchPending && searchQuery.trim() !== ""}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("gatherings:manage.invite.noConnections")
        }
        emptyMessage={
          connectionsSearch.isError
            ? t("gatherings:create.v2.who.cohostsLoadError")
            : !isSearchPending && people.length > 0
              ? t("gatherings:manage.invite.allListedInvited")
              : undefined
        }
        listFooter={<InviteMembersListFooter connections={connectionsSearch} />}
      />

      <div className={styles.pickerFooter}>
        <InviteMembersSelectedCount count={selected.size} max={MAX_INVITES} />
      </div>
    </Modal>
  );
}
