import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  FormField,
  HubBackLink,
  Select,
  Sending,
  SuccessPanel,
} from "../../shared/components/ui";
import { PageMeta } from "../../shared/seo";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateCommissionInterest } from "./api/useCreateCommissionInterest";
import {
  COMMISSION_CATS,
  COMMISSION_CAT_LABEL_KEY,
  type CommissionCat,
} from "./commissionCategories";
import styles from "./CommissionInterestPage.module.css";

// Field limits copied from `CreateCommissionInterestDto` on the backend
// (`@MaxLength`). Stopping the typing here means a member never loses a long
// note to a 400 they cannot read.
const MAX_TITLE_LENGTH = 500;
const MAX_RECIPIENT_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Register interest in a commission, live.
 *
 * WHY THIS ONE PAGE IS LIVE WHILE THE REST OF CULTURE IS NOT. Culture's four
 * tabs (club picks, commission board, showcase, radio) are curated editorial
 * content that exists only in the demo mocks, and the `content` module behind
 * them is read-only with no admin CRUD, so live they are empty boxes nothing
 * can ever be published into. That is why `/magazine/culture` still resolves to
 * `CultureComingSoon`. The commission board is the exception because it is the
 * only part with a real pipeline on both ends: `POST /commissions/interest`
 * writes a member's submission to the `commission_interest` table, and
 * `/admin/commission-interests` is a staffed queue where an admin (or an
 * `editorial` staff-role holder) reads every row. The gate is drawn around the
 * empty tabs, and this page steps outside it. PRD-46.
 *
 * The form asks for the three fields the endpoint requires plus the optional
 * note, because with the curated board unpublished there is no project card to
 * copy a title and a recipient off. `useCreateCommissionInterest` keeps demo
 * mode offline, so this page is safe to reach in either mode.
 *
 * WHAT THE SUCCESS COPY MAY PROMISE. Nothing but the queue. QueerPulse sends no
 * email, and there is no `commission_interest` notification type on the backend
 * (`src/notifications/` has none), so no reply of any kind reaches the member
 * from this submission. The copy says exactly that.
 */
export function CommissionInterestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mutation = useCreateCommissionInterest();

  const [commissionTitle, setCommissionTitle] = useState("");
  const [commissionCategory, setCommissionCategory] = useState<CommissionCat>(
    COMMISSION_CATS[0],
  );
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");

  const isReadyToSend =
    commissionTitle.trim().length > 0 && recipientName.trim().length > 0;

  function submit() {
    if (!isReadyToSend || mutation.isPending) return;
    mutation.mutate({
      commissionTitle: commissionTitle.trim(),
      commissionCategory,
      recipientName: recipientName.trim(),
      message: message.trim() || undefined,
    });
  }

  function startAnother() {
    setCommissionTitle("");
    setCommissionCategory(COMMISSION_CATS[0]);
    setRecipientName("");
    setMessage("");
    mutation.reset();
  }

  return (
    <PageShell>
      <PageMeta
        title={t("culture:commissionInterestPage.metaTitle")}
        description={t("culture:commissionInterestPage.metaDescription")}
        noIndex
      />
      <div className={styles.wrap}>
        <HubBackLink
          to={routes.culture}
          label={t("culture:commissionInterestPage.hubLabel")}
        />

        {mutation.isSuccess ? (
          <SuccessPanel
            title={t("culture:commissionInterestPage.success.title")}
            em={t("culture:commissionInterestPage.success.em")}
            steps={[
              t("culture:commissionInterestPage.success.step1"),
              t("culture:commissionInterestPage.success.step2"),
              t("culture:commissionInterestPage.success.step3"),
            ]}
            closeLabel={t("culture:commissionInterestPage.success.backCta")}
            onClose={() => void navigate(routes.culture)}
            footer={
              <Button variant="ghost-dark" size="sm" onClick={startAnother}>
                {t("culture:commissionInterestPage.success.anotherCta")}
              </Button>
            }
          >
            {t("culture:commissionInterestPage.success.body")}
          </SuccessPanel>
        ) : (
          <>
            <header className={styles.head}>
              <p className={styles.eyebrow}>
                {t("culture:commissionInterestPage.eyebrow")}
              </p>
              <h1 className={styles.title}>
                <Translation
                  i18nKey="culture:commissionInterestPage.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <p className={styles.intro}>
                {t("culture:commissionInterestPage.intro")}
              </p>
              <p className={styles.intro}>
                {t("culture:commissionInterestPage.introReach")}
              </p>
            </header>

            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                submit();
              }}
            >
              <FormField
                label={t("culture:commissionInterestPage.titleLabel")}
                helper={t("culture:commissionInterestPage.titleHelper")}
                required
              >
                <input
                  type="text"
                  value={commissionTitle}
                  maxLength={MAX_TITLE_LENGTH}
                  onChange={(event) => setCommissionTitle(event.target.value)}
                />
              </FormField>

              <FormField
                label={t("culture:commissionInterestPage.categoryLabel")}
                helper={t("culture:commissionInterestPage.categoryHelper")}
                required
              >
                <Select
                  value={commissionCategory}
                  onChange={(value) =>
                    setCommissionCategory(
                      (value as CommissionCat | null) ?? COMMISSION_CATS[0],
                    )
                  }
                  options={COMMISSION_CATS.map((category) => ({
                    value: category,
                    label: t(COMMISSION_CAT_LABEL_KEY[category]),
                  }))}
                />
              </FormField>

              <FormField
                label={t("culture:commissionInterestPage.recipientLabel")}
                helper={t("culture:commissionInterestPage.recipientHelper")}
                required
              >
                <input
                  type="text"
                  value={recipientName}
                  maxLength={MAX_RECIPIENT_LENGTH}
                  onChange={(event) => setRecipientName(event.target.value)}
                />
              </FormField>

              <FormField
                label={t("culture:commissionInterestPage.messageLabel")}
                helper={t("culture:commissionInterestPage.messageHelper")}
              >
                <textarea
                  rows={5}
                  value={message}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </FormField>

              {mutation.isError && (
                <div className={styles.error} role="alert">
                  <FiAlertCircle aria-hidden />
                  <div>
                    <p className={styles.errorTitle}>
                      {t("culture:commissionInterestPage.error.title")}
                    </p>
                    <p className={styles.errorBody}>
                      {t("culture:commissionInterestPage.error.body")}
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.foot}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isReadyToSend || mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Sending
                      label={t("culture:commissionInterestPage.sending")}
                    />
                  ) : mutation.isError ? (
                    t("culture:commissionInterestPage.error.retryCta")
                  ) : (
                    t("culture:commissionInterestPage.submitCta")
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </PageShell>
  );
}
