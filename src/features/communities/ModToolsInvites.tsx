import { useMemo, useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import {
  Button,
  EmptyState,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useSocial } from "../../app/providers/useSocial";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import {
  MAX_INVITES_PER_CALL,
  type CommunityInvitesResponseDTO,
} from "./api/communityInvites.api";
import { useInviteCommunityMembers } from "./api/useCommunityInvites";
import { useRoster } from "./api/useRoster";
import { ModToolsInviteResult } from "./ModToolsInviteResult";
import detail from "./CommunityDetailPage.module.css";
import styles from "./ModToolsPanels.module.css";

/**
 * Staff invite members into the community after founding day.
 *
 * Until now the only invites a community could ever send were the ones its
 * founder typed on the create form, which capped every community at whoever
 * happened to be around on day one. The pool is the sender's own connections,
 * the same source the persona co-owner invite uses: a staff role is not a
 * reason to hand someone the whole member directory to page through.
 *
 * An invitation is an invitation. Nobody selected here joins anything; the
 * result panel reports exactly who was reached and who was passed over.
 */
export function ModToolsInvites({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const { isBlocked } = useSocial();
  const { roster } = useRoster(slug);
  const { views, loading } = useConnectionsList("all");
  const invite = useInviteCommunityMembers(slug);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<CommunityInvitesResponseDTO | null>(
    null,
  );

  const rosterSlugs = useMemo(
    () => new Set(roster.map((member) => member.slug).filter(Boolean)),
    [roster],
  );

  const candidates = useMemo<MemberSelectPerson[]>(
    () =>
      views
        .filter((view) => !isBlocked(view.slug) && !rosterSlugs.has(view.slug))
        .map((view) => ({
          slug: view.slug,
          name: view.name,
          avatarUrl: view.photo,
          pronouns: view.pron,
        })),
    [views, isBlocked, rosterSlugs],
  );

  const nameForSlug = (memberSlug: string) =>
    candidates.find((candidate) => candidate.slug === memberSlug)?.name ??
    memberSlug;

  const toggle = (memberSlug: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(memberSlug)) next.delete(memberSlug);
      else if (next.size < MAX_INVITES_PER_CALL) next.add(memberSlug);
      return next;
    });
  };

  const send = () => {
    const memberSlugs = [...selected];
    if (memberSlugs.length === 0) return;
    invite.mutate(memberSlugs, {
      onSuccess: (response) => {
        setResult(response);
        setSelected(new Set());
      },
      onError: () =>
        showToast(t("communities:detail.modtools.invites.errorToast"), "error"),
    });
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div className={detail.secLbl}>
        {t("communities:detail.modtools.invites.label")}
      </div>
      <p className={styles.intro}>
        {t("communities:detail.modtools.invites.intro", {
          max: fmt.number(MAX_INVITES_PER_CALL),
        })}
      </p>

      {!loading && candidates.length === 0 ? (
        <EmptyState
          compact
          icon={<FiUserPlus />}
          title={t("communities:detail.modtools.invites.empty.title")}
          description={t(
            "communities:detail.modtools.invites.empty.description",
          )}
        />
      ) : (
        <div className={styles.picker}>
          <MemberSelectList
            people={candidates}
            selected={selected}
            onToggle={toggle}
            cap={MAX_INVITES_PER_CALL}
            searchPlaceholder={t(
              "communities:detail.modtools.invites.searchPlaceholder",
            )}
          />
          <div className={styles.pickerFoot}>
            <p className={styles.hint}>
              {t("communities:detail.modtools.invites.selectedCount", {
                selected: fmt.number(selected.size),
                max: fmt.number(MAX_INVITES_PER_CALL),
              })}
            </p>
            <Button
              onClick={send}
              disabled={selected.size === 0 || invite.isPending}
            >
              {invite.isPending
                ? t("communities:common.loading")
                : t("communities:detail.modtools.invites.sendCta")}
            </Button>
          </div>
        </div>
      )}

      {result && (
        <ModToolsInviteResult result={result} nameForSlug={nameForSlug} />
      )}
    </div>
  );
}
