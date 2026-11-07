/**
 * VJ (`vj`) wire contract, frontend mirror: pure vocabulary with no app imports.
 * Source of truth: QUEERPULSE-VJ-V2-CONTRACT-2026-11-06.md (on top of
 * QUEERPULSE-VJ-CONTRACT-2026-11-05.md), `queerpulse-backend/src/vj/vj.contract.ts`
 * and `vj-response.ts`. Names, members and string values match it; edit both
 * together. The parts live in colocated `vj.<topic>.ts` files; this barrel
 * re-exports them so importers keep `from "shared/contracts/vj"`.
 */

export * from "./vj.lists";
export * from "./vj.effects";
export * from "./vj.state";
export * from "./vj.tempo";
export * from "./vj.canonical";
export * from "./vj.upgrade";
export * from "./vj.status";
export * from "./vj.rest";
export * from "./vj.codes";
export * from "./vj.socket";
