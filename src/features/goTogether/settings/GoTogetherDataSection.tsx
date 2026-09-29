import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  LoadErrorState,
  SkeletonCard,
} from "../../../shared/components/ui";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { routes } from "../../../app/routeMap";
import { DataCard, Section } from "../../settings/SettingsControls";
import settingsStyles from "../../settings/SettingsPage.module.css";
import {
  useDeleteFriendMatchProfile,
  useFriendMatchProfile,
} from "../api/useFriendMatchProfile";
import { clearQuestionnaireDrafts } from "../questionnaire/questionnaireDraftStorage";

const GO_TOGETHER_QUESTIONNAIRE_RETURN_PATH = `${routes.settings}?pane=data`;
const GO_TOGETHER_QUESTIONNAIRE_PATH = `${routes.goTogetherQuestionnaire}?return=${encodeURIComponent(
  GO_TOGETHER_QUESTIONNAIRE_RETURN_PATH,
)}`;

/**
 * Settings > Data: the member's own Go together questionnaire answers.
 * Mounted inside `DataPane` after the "your data" cards, mirroring how
 * `GroupAddPolicySection` sits as a self-contained section inside
 * `VisibilityPane`.
 *
 * No saved answers routes straight to the questionnaire. Saved answers show
 * when they were last answered, a link to edit them, and a destructive
 * delete that withdraws consent: it removes the answers and pulls the
 * member out of any match still waiting on them, the same as the backend's
 * `DELETE /go-together/profile`.
 *
 * Loading shows a `SkeletonCard`, so the section holds its place and the
 * cookie section below it stays put. A failed load shows a compact
 * `LoadErrorState` with retry, keeping the section, and the member's only
 * path to deleting their answers, on screen. The delete card borrows the
 * pane's own danger-card look (`.dangerCard`/`.dangerTitle`/`.dcBtn.danger`,
 * the same classes the Data & privacy zone uses for deactivate/delete) so it
 * reads as clearly destructive, set apart from the edit action beside it.
 */
export function GoTogetherDataSection() {
  const { t } = useTranslation();
  const format = useFormat();
  const { showToast } = useToast();
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useFriendMatchProfile();
  const deleteAnswers = useDeleteFriendMatchProfile();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  function handleDeleteConfirm() {
    deleteAnswers.mutate(undefined, {
      onSuccess: () => {
        clearQuestionnaireDrafts();
        setIsDeleteConfirmOpen(false);
        showToast(t("goTogether:settings.data.deleted"), "success");
      },
      onError: () => {
        showToast(t("goTogether:settings.data.deleteError"), "error");
      },
    });
  }

  if (isLoading) {
    return (
      <Section label={t("goTogether:settings.data.sectionLabel")}>
        <SkeletonCard />
      </Section>
    );
  }

  if (isError || !profile) {
    return (
      <Section label={t("goTogether:settings.data.sectionLabel")}>
        <LoadErrorState compact onRetry={() => void refetch()} />
      </Section>
    );
  }

  const hasAnswers = Boolean(profile.answers);

  return (
    <Section label={t("goTogether:settings.data.sectionLabel")}>
      {!hasAnswers ? (
        <div className={settingsStyles.dataCards}>
          <DataCard
            title={t("goTogether:settings.data.empty.title")}
            description={t("goTogether:settings.data.empty.description")}
            button={t("goTogether:settings.data.empty.cta")}
            to={GO_TOGETHER_QUESTIONNAIRE_PATH}
          />
        </div>
      ) : (
        <>
          <div className={settingsStyles.dataCards}>
            <DataCard
              title={t("goTogether:settings.data.card.title")}
              description={
                profile.updatedAt
                  ? t("goTogether:settings.data.card.lastAnswered", {
                      date: format.date(new Date(profile.updatedAt)),
                    })
                  : t("goTogether:settings.data.card.saved")
              }
              button={t("goTogether:settings.data.card.editCta")}
              to={GO_TOGETHER_QUESTIONNAIRE_PATH}
            />
            <div
              className={`${settingsStyles.dataCard} ${settingsStyles.dangerCard}`}
            >
              <div className={settingsStyles.dcText}>
                <div
                  className={`${settingsStyles.dcTitle} ${settingsStyles.dangerTitle}`}
                >
                  {t("goTogether:settings.data.delete.title")}
                </div>
                <div className={settingsStyles.dcDesc}>
                  {t("goTogether:settings.data.delete.description")}
                </div>
              </div>
              <Button
                variant="ghost"
                className={`${settingsStyles.dcBtn} ${settingsStyles.danger}`}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                {t("goTogether:settings.data.delete.cta")}
              </Button>
            </div>
          </div>
          {profile.refreshSuggested && (
            <p className={settingsStyles.toggleHint}>
              {t("goTogether:settings.data.refreshSuggested")}
            </p>
          )}
        </>
      )}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        tone="destructive"
        loading={deleteAnswers.isPending}
        title={t("goTogether:settings.data.deleteConfirm.title")}
        description={t("goTogether:settings.data.deleteConfirm.body")}
        confirmLabel={t("goTogether:settings.data.deleteConfirm.confirm")}
      />
    </Section>
  );
}
