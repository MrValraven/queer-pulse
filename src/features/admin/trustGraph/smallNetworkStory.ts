import { activeLocale } from "../../../shared/i18n/locale";
import type { TrustGraph } from "./trustGraphModel";
import { inboundTrustLinks } from "./trustPath";
import type { Translate } from "./trustPathSentence";

/** D1: the story card shows for members with this many active direct
 *  connections or fewer. */
export const SMALL_NETWORK_MAX = 5;
const STORY_VOUCHER_LIMIT = 3;

interface VoucherClause {
  isVerified: boolean;
  name: string;
  when: string;
}

interface InviteClause {
  name: string;
  when: string;
}

function activeDirectConnectionCount(
  graph: TrustGraph,
  personId: string,
): number {
  const neighbourIds = new Set<string>();
  for (const edge of graph.incidentEdges(personId)) {
    if (edge.withdrawn || edge.from === edge.to) continue;
    neighbourIds.add(edge.from === personId ? edge.to : edge.from);
  }
  return neighbourIds.size;
}

/** Up to three inbound vouchers, oldest vouch first, one clause each. */
function voucherClauses(
  graph: TrustGraph,
  personId: string,
  formatMonth: (isoOrMonth: string) => string,
): VoucherClause[] {
  const earliestDateByVoucher = new Map<string, string>();
  for (const link of inboundTrustLinks(graph, personId)) {
    if (link.kind !== "vouch") continue;
    const knownDate = earliestDateByVoucher.get(link.voucherId);
    if (knownDate === undefined || link.edge.date < knownDate) {
      earliestDateByVoucher.set(link.voucherId, link.edge.date);
    }
  }
  return [...earliestDateByVoucher.entries()]
    .map(([voucherId, date]) => ({
      voucher: graph.peopleById[voucherId],
      voucherId,
      date,
    }))
    .sort(
      (left, right) =>
        left.date.localeCompare(right.date) ||
        (left.voucher?.name ?? left.voucherId).localeCompare(
          right.voucher?.name ?? right.voucherId,
        ),
    )
    .slice(0, STORY_VOUCHER_LIMIT)
    .map(({ voucher, voucherId, date }): VoucherClause => ({
      isVerified: Boolean(voucher?.verified),
      name: voucher?.name ?? voucherId,
      when: formatMonth(date),
    }));
}

/** The invite clause: the inbound invite edge first, else the join path. */
function inviteClause(
  graph: TrustGraph,
  personId: string,
  formatMonth: (isoOrMonth: string) => string,
): InviteClause | null {
  const inviteLink = inboundTrustLinks(graph, personId).find(
    (link) => link.kind === "invite",
  );
  if (inviteLink) {
    return {
      name:
        graph.peopleById[inviteLink.voucherId]?.name ?? inviteLink.voucherId,
      when: formatMonth(inviteLink.edge.date),
    };
  }
  const person = graph.peopleById[personId];
  const joinPath = person?.joinPath;
  if (joinPath?.kind !== "invite" || !joinPath.byName) return null;
  const when = joinPath.at ?? person?.joinedAt ?? person?.joined;
  return {
    name: joinPath.byName,
    when: when ? formatMonth(when) : "",
  };
}

/** D1: "Vouched for by Ana (verified, Jul 2026) and Rui (Aug 2026), invited
 *  by Mo". The vouchers join into one list. Null when the member has no
 *  active direct connections, more than SMALL_NETWORK_MAX of them (in view,
 *  or inbound platform-wide, so a member at the edge of a truncated view is
 *  never told as small), or nothing inbound to tell. */
export function describeSmallNetwork(
  graph: TrustGraph,
  personId: string,
  t: Translate,
  formatMonth: (isoOrMonth: string) => string,
  locale: string = activeLocale(),
): string | null {
  const connectionCount = activeDirectConnectionCount(graph, personId);
  if (connectionCount === 0 || connectionCount > SMALL_NETWORK_MAX) return null;
  const platformInboundCount =
    graph.peopleById[personId]?.activeInboundCount ?? 0;
  if (platformInboundCount > SMALL_NETWORK_MAX) return null;

  const vouchers = voucherClauses(graph, personId, formatMonth);
  const invite = inviteClause(graph, personId, formatMonth);
  if (vouchers.length === 0 && !invite) return null;

  const sentenceParts: string[] = [];
  if (vouchers.length > 0) {
    const names = new Intl.ListFormat(locale, { type: "conjunction" }).format(
      vouchers.map((voucher) =>
        t(
          `admin:vouchGraph.inspector.story.voucher.${voucher.isVerified ? "verified" : "plain"}`,
          { name: voucher.name, when: voucher.when },
        ),
      ),
    );
    sentenceParts.push(
      t("admin:vouchGraph.inspector.story.vouchedByList", { names }),
    );
  }
  if (invite) {
    sentenceParts.push(
      t(
        `admin:vouchGraph.inspector.story.${sentenceParts.length === 0 ? "lead" : "more"}.invitedBy`,
        { name: invite.name, when: invite.when },
      ),
    );
  }
  return sentenceParts.join(", ");
}
