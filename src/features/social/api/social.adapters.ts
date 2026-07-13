import { memberRefToPerson, type Person } from "../../../shared/api/refs";
import type { BlockDTO, MuteDTO } from "./social.api";

/** Render-ready person for a blocked member (Connections "Blocked" tab). */
export const blockDtoToPerson = (dto: BlockDTO): Person | null =>
  memberRefToPerson(dto.member);

/** Render-ready person for a muted member. */
export const muteDtoToPerson = (dto: MuteDTO): Person | null =>
  memberRefToPerson(dto.member);
