import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  MemberSelectList,
  type MemberSelectListProps,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useConnectionsSearch } from "../connect/api/useConnectionsSearch";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { InviteMembersListFooter } from "./InviteMembersListFooter";
import { InviteMembersSelectedCount } from "./InviteMembersSelectedCount";
import { MEMBER_POOL } from "./manageCohosts.data";
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
  const { demoMode } = useDemoMode();
  const inviteMembers = useInviteMembers(slug);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Who a host can invite: their own accepted connections. Live mode never
  // falls back to the demo registry `MEMBER_POOL`, whose invented slugs would
  // 404. Live search runs on the server across every page, and a pick made
  // under an earlier search stays in `selected` and is sent with the rest.
  const connectionsSearch = useConnectionsSearch(searchQuery);
  const { views: connections, isSearchPending } = connectionsSearch;

  const people = useMemo<MemberSelectPerson[]>(() => {
    const candidates = demoMode
      ? MEMBER_POOL.map((candidate) => ({
          slug: candidate.slug,
          name: candidate.name,
          photo: candidate.photo,
          pron: candidate.pronouns,
        }))
      : connections;
    return candidates.map((candidate) => ({
      slug: candidate.slug,
      name: candidate.name,
      avatarUrl: candidate.photo,
      pronouns: candidate.pron,
      staffRole: staffMap[candidate.slug]?.tier ?? undefined,
      staffBadgedRoles: staffMap[candidate.slug]?.badgedStaffRoles,
    }));
  }, [demoMode, connections, staffMap]);

  // Demo keeps the list's own local search over `MEMBER_POOL`. Live hands the
  // query to the server, and names why the list is empty once it has answered.
  const liveListProps: Partial<MemberSelectListProps> = demoMode
    ? {}
    : {
        searchQuery,
        onSearchChange: setSearchQuery,
        isSearching: isSearchPending && searchQuery.trim() !== "",
        emptyMessage: connectionsSearch.isError
          ? t("gatherings:create.v2.who.cohostsLoadError")
          : !isSearchPending && people.length > 0
            ? t("gatherings:manage.invite.allListedInvited")
            : undefined,
        listFooter: <InviteMembersListFooter connections={connectionsSearch} />,
      };

  const toggle = (memberSlug: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(memberSlug)) next.delete(memberSlug);
      else if (next.size < MAX_INVITES) next.add(memberSlug);
      return next;
    });
  };

  const send = () => {
    if (selected.size === 0) return;
    // Demo → no-op mutation, optimistic UI here. Live → fires the POST + invalidate.
    inviteMembers.mutate([...selected]);
    setSent(true);
    showToast(
      t("gatherings:manage.invite.sentToast", { count: selected.size }),
      "success",
    );
  };

  if (sent) {
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
            values={{ count: selected.size }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.invite.successMeta", {
          count: selected.size,
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
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <MemberSelectList
        people={people}
        selected={selected}
        onToggle={toggle}
        cap={MAX_INVITES}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:manage.invite.searchLabel")}
        emptyHint={
          isSearchPending
            ? t("gatherings:manage.invite.loadingPeople")
            : t("gatherings:manage.invite.noConnections")
        }
        {...liveListProps}
      />

      <div className={styles.pickerFooter}>
        <InviteMembersSelectedCount count={selected.size} max={MAX_INVITES} />
      </div>
    </Modal>
  );
}
