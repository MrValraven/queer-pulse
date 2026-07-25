import type {
  TrustGraphData,
  VouchEdge,
  VouchPerson,
} from "../trustGraph/trustGraphModel";
import { ymValue } from "../trustGraph/trustGraphModel";
import type { TrustNetworkDTO } from "./adminTrustNetwork.api";

/** ISO → 'YYYY-MM'. */
function toMonth(iso: string): string {
  return iso.slice(0, 7);
}

const ANCHOR_R = 215;

export function trustNetworkDtoToData(dto: TrustNetworkDTO): TrustGraphData {
  const people: VouchPerson[] = dto.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    pronoun: node.pronouns ?? "",
    initials: node.initials,
    tone: node.tone,
    joined: toMonth(node.joinedAt),
    standing: node.standing,
    sceneId: node.sceneId,
    role: node.role,
    reports: node.openReportCount,
    private: node.private,
    verified: node.verified,
    avatarUrl: node.avatarUrl,
  }));
  const peopleById: Record<string, VouchPerson> = Object.fromEntries(
    people.map((person) => [person.id, person]),
  );
  const edges: VouchEdge[] = dto.edges.map((edge) => ({
    id: edge.id,
    from: edge.from,
    to: edge.to,
    mutual: edge.mutual,
    withdrawn: edge.withdrawn,
    date: toMonth(edge.createdAt),
    relationship: edge.relationship,
    reason: edge.note,
    anonymous: edge.anonymous,
  }));

  // Even angular spread of the distinct scenes around the focus.
  const sceneAnchor: Record<string, { x: number; y: number }> = {};
  dto.scenes.forEach((scene, index) => {
    const angle = (index / Math.max(1, dto.scenes.length)) * Math.PI * 2 - Math.PI / 2;
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
  };
}
