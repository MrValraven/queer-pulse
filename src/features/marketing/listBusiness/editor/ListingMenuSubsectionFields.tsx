import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
  CollapseListItem,
  ConfirmDialog,
  FormField,
  IconButton,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  isBlankMenuItem,
  MENU_SUBSECTION_TITLE_MAX,
  menuSubsectionProblem,
  type ListingMenuSubsectionRow,
} from "../listingMenu.data";
import type { ListingMenuCurrency } from "../listingMenuPrice.data";
import type { ListingForm } from "../useListingForm";
import { ListingMenuSubsectionItemFields } from "./ListingMenuSubsectionItemFields";
import menuStyles from "./ListingMenu.module.css";
import styles from "./ListingMenuSubsection.module.css";

/**
 * One sub-section card inside a menu section: its title, the items priced per
 * glass and per bottle, and the buttons that move or remove it. Removing a
 * sub-section that still holds typed items asks first.
 */
export function ListingMenuSubsectionFields({
  form,
  sectionId,
  subsection,
  currency,
  position,
  total,
  isAtItemCeiling,
}: {
  form: ListingForm;
  sectionId: string;
  subsection: ListingMenuSubsectionRow;
  currency: ListingMenuCurrency;
  /** 1-based among the section's sub-sections, for the accessible names. */
  position: number;
  total: number;
  isAtItemCeiling: boolean;
}) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const subsectionName =
    subsection.title.trim() ||
    t("marketing:listBusiness.menu.unnamedSubsection", { position });
  const hasTypedItems = subsection.items.some((item) => !isBlankMenuItem(item));

  function requestRemove() {
    if (hasTypedItems) setIsConfirmOpen(true);
    else form.removeMenuSubsection(sectionId, subsection.id);
  }

  return (
    <div className={styles.subsection} role="group" aria-label={subsectionName}>
      <div className={styles.subsectionHead}>
        <FormField
          className={menuStyles.field}
          label={t("marketing:listBusiness.menu.subsectionTitleLabel")}
          error={
            menuSubsectionProblem(subsection) === "title"
              ? t("marketing:listBusiness.menu.subsectionTitleError")
              : undefined
          }
        >
          <input
            type="text"
            maxLength={MENU_SUBSECTION_TITLE_MAX}
            placeholder={t(
              "marketing:listBusiness.menu.subsectionTitlePlaceholder",
            )}
            value={subsection.title}
            onChange={(event) =>
              form.setMenuSubsectionTitle(
                sectionId,
                subsection.id,
                event.target.value,
              )
            }
          />
        </FormField>
        <div
          className={[menuStyles.controls, styles.alignedControls].join(" ")}
        >
          <IconButton
            size="sm"
            aria-label={t("marketing:listBusiness.menu.moveSubsectionUp", {
              name: subsectionName,
            })}
            disabled={position === 1}
            onClick={() =>
              form.moveMenuSubsection(sectionId, subsection.id, -1)
            }
          >
            <FiArrowUp aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            aria-label={t("marketing:listBusiness.menu.moveSubsectionDown", {
              name: subsectionName,
            })}
            disabled={position === total}
            onClick={() => form.moveMenuSubsection(sectionId, subsection.id, 1)}
          >
            <FiArrowDown aria-hidden />
          </IconButton>
          <IconButton
            size="sm"
            aria-label={t("marketing:listBusiness.menu.removeSubsection", {
              name: subsectionName,
            })}
            onClick={requestRemove}
          >
            <FiTrash2 aria-hidden />
          </IconButton>
        </div>
      </div>

      <ul className={styles.subItems}>
        <AnimatePresence initial={false}>
          {subsection.items.map((item, index) => (
            <CollapseListItem key={item.id}>
              <ListingMenuSubsectionItemFields
                form={form}
                sectionId={sectionId}
                subsectionId={subsection.id}
                item={item}
                currency={currency}
                position={index + 1}
                total={subsection.items.length}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>

      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => form.addSubsectionItem(sectionId, subsection.id)}
          disabled={isAtItemCeiling}
        >
          <FiPlus aria-hidden /> {t("marketing:listBusiness.menu.addItemCta")}
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          form.removeMenuSubsection(sectionId, subsection.id);
        }}
        tone="destructive"
        title={t("marketing:listBusiness.menu.removeSubsectionConfirmTitle", {
          name: subsectionName,
        })}
        description={t(
          "marketing:listBusiness.menu.removeSubsectionConfirmBody",
        )}
        confirmLabel={t(
          "marketing:listBusiness.menu.removeSubsectionConfirmCta",
        )}
      />
    </div>
  );
}
