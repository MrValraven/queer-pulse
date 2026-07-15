import { apiPost } from "../../../shared/api/client";
import type { CommissionCat } from "../culture.data";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `culture` domain accepts/returns (POST /commissions/interest).
// The Commission Board's projects themselves (`COMMISSIONS` in `culture.data.tsx`)
// are curated editorial content with no backend listing — this is the one real
// piece of member-submitted data on the Culture page: expressing interest in a
// project via `CommissionInterestModal`.

export interface CreateCommissionInterestDto {
  commissionTitle: string;
  commissionCategory: CommissionCat;
  recipientName: string;
  message?: string;
}

export interface CommissionInterestResponseDTO {
  id: string;
  commissionTitle: string;
  commissionCategory: CommissionCat;
  recipientName: string;
  message: string | null;
  createdAt: string;
}

export const createCommissionInterest = (dto: CreateCommissionInterestDto) =>
  apiPost<CommissionInterestResponseDTO>("/commissions/interest", dto);
