import { FormField } from "../../shared/components/ui/FormField";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MAX_NOW_READING_LENGTH } from "./startCommunity/startCommunity.data";

interface EditCommunityNowReadingFieldProps {
  value: string;
  onChange: (nowReading: string) => void;
  /** True while the draft carries the `book-club` tag. */
  isVisible: boolean;
}

/** The edit modal's "Now reading" field. Only a reading group names the book
 *  it is on, so the field follows the `book-club` tag: picking that tag in the
 *  tag picker near the end of this form reveals it here, under the tagline. */
export function EditCommunityNowReadingField({
  value,
  onChange,
  isVisible,
}: EditCommunityNowReadingFieldProps) {
  const { t } = useTranslation();
  if (!isVisible) return null;
  return (
    <FormField
      label={t("communities:edit.field.nowReading")}
      helper={t("communities:edit.field.nowReadingHint")}
    >
      <input
        type="text"
        value={value}
        maxLength={MAX_NOW_READING_LENGTH}
        placeholder={t("communities:edit.field.nowReadingPlaceholder")}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}
