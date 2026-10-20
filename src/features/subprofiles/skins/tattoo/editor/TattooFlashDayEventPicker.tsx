import { useState } from "react";
import { FiLink2, FiX } from "react-icons/fi";
import {
  Button,
  Collapse,
  FormField,
  Select,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { formatItemDate } from "../../../../../shared/lib/date";
import { useFlashDayEventOptions } from "../../../api/useFlashDayEventOptions";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import type { FlashDayEventRef } from "../../../api/subprofiles.api";
import { useSubprofileEditorContext } from "../../../subprofileEditorContext";
import {
  localCalendarDate,
  withFlashDayEvent,
  withoutFlashDayEvent,
} from "./tattooItemDraft";
import styles from "./TattooFlashDayEventPicker.module.css";

/**
 * Links a flash day to an event the persona's owners host, co-host or play on.
 * Hidden while the persona (loaded, or as the meta draft would leave it) is
 * unlinked, and the query only runs while it is shown.
 */
export function TattooFlashDayEventPicker({
  draft,
  onPatch,
}: {
  draft: SubprofileItemView;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t, language } = useTranslation();
  const { subprofile, meta } = useSubprofileEditorContext();
  const isShown =
    subprofile.linkVisibility === "linked" &&
    meta.metaSnapshot().link === "linked";
  const eventOptions = useFlashDayEventOptions(subprofile.id, isShown);
  const options: FlashDayEventRef[] = eventOptions.data ?? [];
  const linkedSlug = draft.structured?.flashDay?.eventSlug ?? "";
  const isLinked = linkedSlug !== "";
  const linkedTitle =
    options.find((option) => option.slug === linkedSlug)?.title ??
    draft.linkedEvent?.title ??
    t("subprofiles:tattooItem.event.linkedFallback");

  let statusKey: string | null = null;
  if (eventOptions.isError) statusKey = "subprofiles:tattooItem.event.error";
  else if (eventOptions.isPending)
    statusKey = "subprofiles:tattooItem.event.loading";
  else if (options.length === 0 && !isLinked)
    statusKey = "subprofiles:tattooItem.event.empty";

  const [shownStatusKey, setShownStatusKey] = useState<string | null>(null);
  if (statusKey !== null && statusKey !== shownStatusKey) {
    setShownStatusKey(statusKey);
  }

  function pickEvent(slug: string | null) {
    const picked = options.find((option) => option.slug === slug);
    if (picked) onPatch(withFlashDayEvent(draft, picked));
  }

  return (
    <Collapse isOpen={isShown}>
      <div className={styles.picker}>
        <Collapse isOpen={isLinked}>
          <div className={styles.linkedRow}>
            <p className={styles.linkedTitle}>
              <FiLink2 aria-hidden="true" /> {linkedTitle}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPatch(withoutFlashDayEvent(draft))}
            >
              <FiX aria-hidden="true" />
              {t("subprofiles:tattooItem.event.remove")}
            </Button>
          </div>
        </Collapse>
        <Collapse isOpen={!isLinked}>
          <FormField
            label={t("subprofiles:tattooItem.event.label")}
            helper={t("subprofiles:tattooItem.event.helper")}
          >
            <Select
              placeholder={t("subprofiles:tattooItem.event.none")}
              value={null}
              loading={eventOptions.isPending}
              options={options.map((option) => ({
                value: option.slug,
                label: t("subprofiles:tattooItem.event.option", {
                  title: option.title,
                  date: formatItemDate(
                    localCalendarDate(option.startsAt),
                    language,
                  ),
                }),
                keywords: option.title,
              }))}
              onChange={pickEvent}
            />
          </FormField>
        </Collapse>
        <Collapse isOpen={statusKey !== null}>
          <p className={styles.status} role="status">
            {shownStatusKey === null ? "" : t(shownStatusKey)}
          </p>
        </Collapse>
      </div>
    </Collapse>
  );
}
