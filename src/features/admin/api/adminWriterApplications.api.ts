import { apiGet, apiPatch } from "../../../shared/api/client";
import type {
  WriterApplicationDTO,
  WriterApplicationStatus,
} from "../../magazine/api/writerApplications.api";

/**
 * Admin triage of magazine writer applications
 * (`/admin/writer-applications`, admin-only). Mirrors
 * `adminMagazineSubmissions.api.ts`'s shape.
 */

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
}

export interface AdminWriterApplicationDTO extends WriterApplicationDTO {
  applicant: AdminPersonDTO | null;
}

export interface AdminWriterApplicationsPageDTO {
  items: AdminWriterApplicationDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const getAdminWriterApplications = (parameters: {
  page?: number;
  status?: WriterApplicationStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminWriterApplicationsPageDTO>(
    `/admin/magazine-writer-applications${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

export const triageWriterApplication = (
  id: string,
  dto: { status: "approved" | "declined"; reviewNote?: string },
) =>
  apiPatch<AdminWriterApplicationDTO>(
    `/admin/magazine-writer-applications/${id}`,
    dto,
  );
