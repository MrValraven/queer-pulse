import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DISCIPLINE_LABEL_KEY,
  PROFESSION_LABEL_KEY,
} from "./memberDirectoryFilter.data";
import type { MemberProfile } from "./data/memberProfiles";

/**
 * The "Works in" row: what the member picked in the profile editor's field-of-
 * work picker, resolved from stored ids back to display labels. Professions win
 * when set — "Nurse" says more than "Healthcare" — and the broad fields show
 * only when no profession was narrowed down to.
 *
 * Public and ungated, like `tags`: these are the same values the member
 * directory's "What they do" / "Profession" filters search on, so a member who
 * sets one is stating it publicly by definition.
 *
 * Shared by the desktop hero and the mobile header, which style their chip rows
 * differently — hence the injected class names rather than a CSS module here.
 */
export function ProfileWorkRow({
  profile,
  classNames,
}: {
  profile: MemberProfile;
  /** CSS-module class values, which are typed `string | undefined` under this
   *  repo's index-access checking — passed through as-is. */
  classNames: {
    row: string | undefined;
    label: string | undefined;
    chip: string | undefined;
  };
}) {
  const { t } = useTranslation();
  const professions = profile.profession ?? [];
  const fields = profile.discipline ?? [];
  // An id with no entry in the vocabulary (a chip retired since the member
  // picked it) resolves to nothing rather than printing a raw id.
  const chips = (
    professions.length > 0
      ? professions.map((id) => PROFESSION_LABEL_KEY[id])
      : fields.map((id) => DISCIPLINE_LABEL_KEY[id])
  ).filter((labelKey): labelKey is string => Boolean(labelKey));

  if (chips.length === 0) return null;

  return (
    <div className={classNames.row}>
      <span className={classNames.label}>
        {t("members:hero.worksIn.label")}
      </span>
      {chips.map((labelKey) => (
        <span key={labelKey} className={classNames.chip}>
          {t(labelKey)}
        </span>
      ))}
    </div>
  );
}
