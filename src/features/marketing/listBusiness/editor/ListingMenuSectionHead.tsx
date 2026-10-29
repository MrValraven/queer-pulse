import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";
import {
  ConfirmDialog,
  FormField,
  IconButton,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  isBlankMenuItem,
  MENU_SECTION_TITLE_MAX,
  menuSectionProblem,
  type ListingMenuSectionRow,
} from "../listingMenu.data";
import type { ListingForm } from "../useListingForm";
import styles from "./ListingMenu.module.css";

/**
 * The top of a menu section: its title field, the move and remove buttons and
 * the confirmation shown before removing a section that holds typed items,
 * direct or inside a sub-section. An empty section goes straight away.
 */
export function ListingMenuSectionHead({
  form,
  section,
  sectionName,
  position,
  total,
}: {
  form: ListingForm;
  section: ListingMenuSectionRow;
  /** The title, or its "section N" fallback, for the accessible names. */
  sectionName: string;
  /** 1-based position among the sections. */
  position: number;
  total: number;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const hasTypedItems =
    section.items.some((item) => !isBlankMenuItem(item)) ||
    section.subsections.some((subsection) =>
      subsection.items.some((item) => !isBlankMenuItem(item)),
    );

  function requestRemove() {
    if (hasTypedItems) setIsConfirmOpen(true);
    else form.removeMenuSection(section.id);
  }

  return (
    <div className={styles.sectionHead}>
      <FormField
        className={styles.field}
        label={t("marketing:listBusiness.menu.sectionTitleLabel")}
        error={
          menuSectionProblem(section) === "title"
            ? t("marketing:listBusiness.menu.sectionTitleError")
            : undefined
        }
      >
        <input
          type="text"
          maxLength={MENU_SECTION_TITLE_MAX}
          placeholder={t("marketing:listBusiness.menu.sectionTitlePlaceholder")}
          value={section.title}
          onChange={(event) =>
            form.setMenuSectionTitle(section.id, event.target.value)
          }
        />
      </FormField>
      <div className={styles.controls}>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.moveSectionUp", {
            name: sectionName,
          })}
          disabled={position === 1}
          onClick={() => form.moveMenuSection(section.id, -1)}
        >
          <FiArrowUp aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.moveSectionDown", {
            name: sectionName,
          })}
          disabled={position === total}
          onClick={() => form.moveMenuSection(section.id, 1)}
        >
          <FiArrowDown aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          aria-label={t("marketing:listBusiness.menu.removeSection", {
            name: sectionName,
          })}
          onClick={requestRemove}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          form.removeMenuSection(section.id);
        }}
        tone="destructive"
        title={t("marketing:listBusiness.menu.removeSectionConfirmTitle", {
          name: sectionName,
        })}
        description={t("marketing:listBusiness.menu.removeSectionConfirmBody")}
        confirmLabel={t("marketing:listBusiness.menu.removeSectionConfirmCta")}
      />
    </div>
  );
}
