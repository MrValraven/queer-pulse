import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ADD_MONTH_SECTION_IDS } from "./addMonth.data";
import styles from "./AddEventMonthPage.module.css";
import { AddMonthSharedEdit } from "./AddMonthSharedEdit";
import { AddMonthTemplatePicker } from "./AddMonthTemplatePicker";
import { AddMonthTemplateSummary } from "./AddMonthTemplateSummary";
import type { AddEventMonthPageModel } from "./useAddEventMonthPage";
import { ADD_MONTH_TEMPLATE_HEADING_ID } from "./useAddMonthPublish";

/**
 * Section 1 of the month page: which event every date copies, what it
 * copies, and the shared place and cost edit.
 */
export function AddMonthTemplateSection({
  page,
  isVenueListingRefused,
}: {
  page: AddEventMonthPageModel;
  isVenueListingRefused: boolean;
}) {
  const { t } = useTranslation();
  const { state, dispatch, options, template } = page;
  const { place, cost } = state;
  return (
    <section
      id={ADD_MONTH_SECTION_IDS.template}
      className={styles.section}
      aria-labelledby={ADD_MONTH_TEMPLATE_HEADING_ID}
    >
      <h2
        id={ADD_MONTH_TEMPLATE_HEADING_ID}
        className={styles.sectionHeading}
        tabIndex={-1}
      >
        {t("gatherings:addMonth.template.heading")}
      </h2>
      <p className={styles.sectionLede}>
        {t("gatherings:addMonth.template.lede")}
      </p>
      <AddMonthTemplatePicker
        options={options.options}
        selectedSlug={state.templateSlug}
        isLoading={options.isLoading}
        isError={options.isError}
        hasNextPage={options.hasNextPage}
        isFetchingNextPage={options.isFetchingNextPage}
        onLoadMore={options.fetchNextPage}
        onRetry={options.refetch}
        onPick={(slug) => dispatch({ type: "pickTemplate", slug })}
        selectedFallback={page.selectedFallback}
        labelledBy={ADD_MONTH_TEMPLATE_HEADING_ID}
      />
      <AddMonthTemplateSummary
        template={template.data}
        failure={page.templateFailure}
        isLoading={template.isLoading}
        place={place}
        cost={cost}
        times={state.times}
        isEditing={page.isEditingShared}
        onToggleEdit={page.toggleEditingShared}
        editSlot={
          place && cost ? (
            <AddMonthSharedEdit
              place={place}
              cost={cost}
              dispatch={dispatch}
              isVenueListingRefused={isVenueListingRefused}
            />
          ) : null
        }
      />
    </section>
  );
}
