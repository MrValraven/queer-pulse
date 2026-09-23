import { useState } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
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
import { ListingMenuItemFields } from "./ListingMenuItemFields";
import styles from "./ListingMenu.module.css";

/**
 * One titled part of the menu and its items. Removing a section that still
 * holds typed items asks first; an empty one goes straight away.
 */
export function ListingMenuSectionFields({
  form,
  section,
  position,
  total,
  isAtItemCeiling,
}: {
  form: ListingForm;
  section: ListingMenuSectionRow;
  /** 1-based, for the buttons' accessible names. */
  position: number;
  total: number;
  isAtItemCeiling: boolean;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const sectionName =
    section.title.trim() ||
    t("marketing:listBusiness.menu.unnamedSection", { position });
  const hasTypedItems = section.items.some((item) => !isBlankMenuItem(item));

  function requestRemove() {
    if (hasTypedItems) setIsConfirmOpen(true);
    else form.removeMenuSection(section.id);
  }

  return (
    <section className={styles.section} aria-label={sectionName}>
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
            placeholder={t(
              "marketing:listBusiness.menu.sectionTitlePlaceholder",
            )}
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
      </div>

      <div className={styles.items}>
        {section.items.map((item, index) => (
          <ListingMenuItemFields
            key={item.id}
            form={form}
            sectionId={section.id}
            item={item}
            position={index + 1}
            total={section.items.length}
          />
        ))}
      </div>
      <p className={styles.dietaryHint}>
        {t("marketing:listBusiness.menu.dietaryHint")}
      </p>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => form.addMenuItem(section.id)}
        disabled={isAtItemCeiling}
      >
        <FiPlus aria-hidden /> {t("marketing:listBusiness.menu.addItemCta")}
      </Button>

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
    </section>
  );
}
