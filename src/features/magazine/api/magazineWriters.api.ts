import { apiGet } from "../../../shared/api/client";

/**
 * A row from GET /magazine/admin/writers: someone the desk can put on a
 * piece. Same shape as `MagazineEditorDto` (the backend answers with
 * `MagazineEditorResponse`), hand-mapped from `Profile` only.
 */
export interface MagazineWriterDto {
  id: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

export const getMagazineWriters = () =>
  apiGet<MagazineWriterDto[]>("/magazine/admin/writers");
