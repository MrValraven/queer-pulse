import { FiMessageCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LANG_LABEL_KEYS } from "./listBusiness/listBusiness.data";
import s from "./DirectorySpacePage.module.css";

interface Props {
  langs?: string[];
}

/** "Languages spoken" row for the venue info card. Live listings store the
 * wizard's canonical language ids ("Português", "English", …), which have
 * i18n label keys via `LANG_LABEL_KEYS`; demo places (directoryPlaces.ts)
 * predate that vocabulary and use short raw codes ("pt", "en") instead — any
 * value with no known mapping falls back to its raw form, uppercased, rather
 * than throwing. Renders nothing when `langs` is absent/empty, which is most
 * demo places (only two seeded entries currently carry it). */
export function DirectoryLanguages({ langs }: Props) {
  const { t } = useTranslation();
  if (!langs || langs.length === 0) return null;

  const labels = langs.map((lang) => {
    const key = LANG_LABEL_KEYS[lang];
    return key ? t(key) : lang.toUpperCase();
  });

  return (
    <div className={s.contactRow}>
      <FiMessageCircle aria-hidden="true" />
      <span>
        <b>{t("marketing:directory.detail.languagesLabel")}: </b>
        {labels.join(", ")}
      </span>
    </div>
  );
}
