import type {
  JoinPath,
  MemberRef,
  TrustCase,
  TrustGraphData,
  TrustRing,
  VouchEdge,
  VouchPerson,
  WeakVoucher,
} from "../trustGraph/trustGraphModel";
import { ymValue } from "../trustGraph/trustGraphModel";
import type {
  TrustCaseDTO,
  TrustJoinPathDTO,
  TrustMemberRefDTO,
  TrustNetworkDTO,
  TrustRingDTO,
  TrustWeakVoucherDTO,
} from "./adminTrustNetwork.api";

/** ISO → 'YYYY-MM'. */
function toMonth(iso: string): string {
  return iso.slice(0, 7);
}

const ANCHOR_R = 215;

/** Backend refs carry the slug; the model keys every node by it as `id`. */
function toMemberRef(ref: TrustMemberRefDTO): MemberRef {
  return { id: ref.slug, name: ref.name };
}

function toWeakVoucher(voucher: TrustWeakVoucherDTO): WeakVoucher {
  return { ...toMemberRef(voucher), reason: voucher.reason };
}

function toJoinPath(joinPath: TrustJoinPathDTO): JoinPath {
  return {
    kind: joinPath.kind,
    byId: joinPath.bySlug,
    byName: joinPath.byName,
    at: joinPath.at,
  };
}

function toTrustRing(ring: TrustRingDTO): TrustRing {
  return {
    id: ring.id,
    memberIds: [...ring.memberSlugs],
    memberCount: ring.memberCount,
    firstJoinedAt: ring.firstJoinedAt,
    lastJoinedAt: ring.lastJoinedAt,
    sharedVouchers: ring.sharedVouchers.map(toMemberRef),
  };
}

function toTrustCase(trustCase: TrustCaseDTO): TrustCase {
  return {
    id: trustCase.id,
    kind: trustCase.kind,
    subjectId: trustCase.subjectSlug,
    subjectName: trustCase.subjectName,
    ringId: trustCase.ringId,
    memberCount: trustCase.memberCount,
    weakVoucherCount: trustCase.weakVoucherCount,
    openReportCount: trustCase.openReportCount,
    windowHours: trustCase.windowHours,
    score: trustCase.score,
  };
}

export function trustNetworkDtoToData(dto: TrustNetworkDTO): TrustGraphData {
  const people: VouchPerson[] = dto.nodes.map((node) => ({
    id: node.id,
    userId: node.userId,
    name: node.name,
    pronoun: node.pronouns ?? "",
    initials: node.initials,
    tone: node.tone,
    joined: toMonth(node.joinedAt),
    standing: node.standing,
    inRing: node.inRing,
    sceneId: node.sceneId,
    role: node.role,
    reports: node.openReportCount,
    private: node.private,
    verified: node.verified,
    avatarUrl: node.avatarUrl,
    joinedAt: node.joinedAt,
    accountKind: node.accountKind,
    ringId: node.ringId,
    isolatedBy: node.isolatedBy.map(toWeakVoucher),
    joinPath: toJoinPath(node.joinPath),
    trackRecord: {
      vouchesGiven: node.trackRecord.vouchesGiven,
      laterFlaggedCount: node.trackRecord.laterFlaggedCount,
    },
    activeInboundCount: node.activeInboundCount,
    activeOutboundCount: node.activeOutboundCount,
    sceneIds: [...node.sceneIds],
  }));
  const peopleById: Record<string, VouchPerson> = Object.fromEntries(
    people.map((person) => [person.id, person]),
  );
  // Sort by the full ISO `createdAt` before truncating to a month, so the
  // replay timeline (which walks edges in array order within a month) reflects
  // the real order people connected. ISO strings sort lexically.
  const edges: VouchEdge[] = [...dto.edges]
    .sort((earlier, later) =>
      earlier.createdAt < later.createdAt
        ? -1
        : earlier.createdAt > later.createdAt
          ? 1
          : 0,
    )
    .map((edge) => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      mutual: edge.mutual,
      withdrawn: edge.withdrawn,
      date: toMonth(edge.createdAt),
      relationship: edge.relationship,
      reason: edge.note,
      anonymous: edge.anonymous,
      kind: edge.kind,
    }));

  // Even angular spread of the distinct scenes around the focus.
  const sceneAnchor: Record<string, { x: number; y: number }> = {};
  dto.scenes.forEach((scene, index) => {
    const angle =
      (index / Math.max(1, dto.scenes.length)) * Math.PI * 2 - Math.PI / 2;
    sceneAnchor[scene.id] = {
      x: Math.cos(angle) * ANCHOR_R,
      y: Math.sin(angle) * ANCHOR_R,
    };
  });

  const months = edges.map((edge) => ymValue(edge.date));
  const tMin = months.length ? Math.min(...months) : ymValue("2023-01");
  const tMax = months.length ? Math.max(...months) : ymValue("2026-07");

  return {
    people,
    peopleById,
    edges,
    scenes: dto.scenes,
    sceneAnchor,
    tMin,
    tMax,
    truncated: dto.truncated,
    rings: dto.rings.map(toTrustRing),
    cases: dto.cases.map(toTrustCase),
    openCaseCount: dto.openCaseCount,
    platformStartedAt: dto.platformStartedAt,
    newAccountWindowDays: dto.newAccountWindowDays,
  };
}
