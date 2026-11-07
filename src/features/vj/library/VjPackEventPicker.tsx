import { useId, useMemo, useState, type JSX } from "react";
import { FiRefreshCw } from "react-icons/fi";
import type { VjEventOptionDTO, VjPackDTO } from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  Collapse,
  Select,
  type SelectOption,
} from "../../../shared/components/ui";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useSetVjPackEvent } from "../api/useSetVjPackEvent";
import { useVjUpcomingEvents } from "../api/useVjUpcomingEvents";
import { VjReasonLine } from "../VjReasonLine";
import { vjEventSearchTextOf, vjEventWhenOf } from "./vjEventOptionLabel";
import styles from "./VjPackEvent.module.css";

/** The linked event as a choice, for a link the upcoming list no longer
 *  carries (the event may have ended). Its summary has no area. */
function linkedEventOptionOf(pack: VjPackDTO): VjEventOptionDTO | null {
  if (pack.event === null) return null;
  return {
    id: pack.event.id,
    title: pack.event.title,
    startAt: pack.event.startAt,
    endAt: null,
    area: null,
    isOnline: false,
  };
}

/** The upcoming events, with the linked one first when the list lacks it. */
function choicesOf(
  pack: VjPackDTO,
  upcoming: readonly VjEventOptionDTO[],
): VjEventOptionDTO[] {
  const linked = linkedEventOptionOf(pack);
  if (linked === null || upcoming.some((event) => event.id === linked.id)) {
    return [...upcoming];
  }
  return [linked, ...upcoming];
}

/** Title on one line; the date plus the area (or Online) on a quieter one. */
function EventOptionRow({
  event,
  locale,
}: {
  event: VjEventOptionDTO;
  locale: string;
}): JSX.Element {
  const { t } = useTranslation();
  const date = vjEventWhenOf(event.startAt, locale);
  const area = event.isOnline
    ? t("vj:packEvent.online")
    : (event.area?.trim() ?? "");
  return (
    <span className={styles.option}>
      <span className={styles.optionTitle}>{event.title}</span>
      <span className={styles.optionLine}>
        {area === "" ? date : t("vj:packEvent.optionLine", { date, area })}
      </span>
    </span>
  );
}

/**
 * The fold under "Link event" or "Change event": a searchable list of the
 * upcoming public and members events, a hint about what the projector shows,
 * then "Link event" and "Cancel". A refusal or a failed load is named inside.
 */
export function VjPackEventPicker({
  pack,
  onDone,
}: {
  pack: VjPackDTO;
  onDone: () => void;
}): JSX.Element {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const locale = intlLocale(language);
  const labelId = useId();
  const upcomingEvents = useVjUpcomingEvents();
  const setPackEvent = useSetVjPackEvent();
  const [chosenEventId, setChosenEventId] = useState<string | null>(
    pack.event?.id ?? null,
  );
  const [refusal, setRefusal] = useState<unknown>(null);

  const choices = useMemo(
    () => choicesOf(pack, upcomingEvents.data ?? []),
    [pack, upcomingEvents.data],
  );
  const options = useMemo<SelectOption[]>(
    () =>
      choices.map((event) => ({
        value: event.id,
        label: event.title,
        keywords: vjEventSearchTextOf(event, locale),
      })),
    [choices, locale],
  );

  const isBlocked =
    chosenEventId === null ||
    chosenEventId === (pack.event?.id ?? null) ||
    setPackEvent.isPending;

  const link = async () => {
    if (isBlocked) return;
    setRefusal(null);
    try {
      const linkedPack = await setPackEvent.mutateAsync({
        packId: pack.id,
        eventId: chosenEventId,
      });
      const chosenTitle =
        linkedPack.event?.title ??
        choices.find((event) => event.id === chosenEventId)?.title ??
        "";
      showToast(
        t("vj:packEvent.toast.linked", {
          pack: linkedPack.name,
          event: chosenTitle,
        }),
        "success",
      );
      onDone();
    } catch (cause) {
      setRefusal(cause);
    }
  };

  return (
    <div className={styles.picker} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {t("vj:packEvent.pickerLabel")}
      </span>
      <Select
        labelledBy={labelId}
        options={options}
        value={chosenEventId}
        onChange={(eventId) => {
          setRefusal(null);
          setChosenEventId(eventId);
        }}
        placeholder={t("vj:packEvent.pickerPlaceholder")}
        searchable
        searchPlaceholder={t("vj:packEvent.pickerSearch")}
        emptyText={t("vj:packEvent.pickerEmpty")}
        loading={upcomingEvents.isPending}
        renderOption={(option) => {
          const event = choices.find((choice) => choice.id === option.value);
          return event === undefined ? (
            option.label
          ) : (
            <EventOptionRow event={event} locale={locale} />
          );
        }}
      />
      <p className={styles.hint}>{t("vj:packEvent.pickerHint")}</p>
      <p className={styles.hint}>{t("vj:packEvent.qrNote")}</p>
      <Collapse isOpen={upcomingEvents.isError}>
        <div className={styles.loadFailure}>
          <VjReasonLine error={upcomingEvents.error} />
          <Button
            variant="quiet"
            size="sm"
            className={styles.reload}
            aria-disabled={upcomingEvents.isFetching || undefined}
            onClick={() => {
              if (upcomingEvents.isFetching) return;
              void upcomingEvents.refetch();
            }}
          >
            <FiRefreshCw aria-hidden="true" fill="none" focusable="false" />
            {t("vj:packEvent.reload")}
          </Button>
        </div>
      </Collapse>
      <VjReasonLine error={refusal} />
      <div className={styles.pickerActions}>
        <Button
          size="sm"
          aria-disabled={isBlocked || undefined}
          onClick={() => void link()}
        >
          {t("vj:packEvent.submit")}
        </Button>
        <Button variant="quiet" size="sm" onClick={onDone}>
          {t("vj:packEvent.cancel")}
        </Button>
      </div>
    </div>
  );
}
