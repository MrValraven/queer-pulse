import { apiGet } from "../../../shared/api/client";
import type { FinLine } from "../../governance/governance.data";

// ── Backend DTOs ────────────────────────────────────────────────────────────
// Shapes the NestJS `governance` domain returns for the admin finances tab
// (GET /governance/admin/finances). Reuses the public `FinLine` shape
// (`governance/governance.data`) so income/expense lines stay consistent
// with the public transparency-report response.

export interface AdminFinanceHistoryPoint {
  quarter: string;
  incomeTotal: number;
  expenseTotal: number;
  surplus: number;
}

export interface AdminFinanceLatest {
  quarter: string;
  incomeTotal: number;
  expenseTotal: number;
  surplus: number;
  mrr: number;
  sustainerCount: number;
  solidarityRate: number;
  income: FinLine[];
  expense: FinLine[];
  publishedAt: string;
}

export interface AdminFinanceResponseDTO {
  latest: AdminFinanceLatest | null;
  history: AdminFinanceHistoryPoint[];
}

export const getAdminFinances = () =>
  apiGet<AdminFinanceResponseDTO>("/governance/admin/finances");
