import { useId, useState } from "react";
import { Button, Modal, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  CommunityBanDTO,
  CommunityRuleOptionDTO,
  UpdateCommunityBanInput,
} from "./api/communityBans.api";
import { useUpdateCommunityBan } from "./api/useCommunityBans";
import { isNoSecondSignatoryError } from "./api/communityBanRatifications.api";
import { CommunityRulePicker } from "./CommunityRulePicker";
import styles from "./CommunityRuleCitation.module.css";

/** The sentinel a `Select` uses for "this ban does not end by itself". */
const PERMANENT_VALUE = "permanent";

/** Lengths a moderator can put on a bar, in days. */
const BAN_DAY_OPTIONS = [1, 3, 7, 14, 30, 90, 180, 365] as const;

/**
 * Revise a ban that is already in place: give it an end date, ask for it to be
 * made permanent, rewrite what the member was told, or cite the house rule it
 * rests on.
 *
 * Asking for permanence is a REQUEST here (PRD-25), and the copy says so.
 * Picking Permanent leaves the end date exactly where it is and opens a hold
 * for a second owner, co-owner or moderator to sign. On a community with
 * nobody else who could sign, the server refuses outright and the bar keeps
 * its end date, which is a specific outcome the moderator is told rather than
 * a generic failure.
 *
 * This is the rung the community ladder was missing. A community ban had no
 * expiry column at all, so a moderator dealing with someone having a bad week
 * chose between doing nothing and barring them for life, and every ban written
 * before now is one of those life bans. This dialog is how one of them becomes
 * a week.
 *
 * Whatever changes here is sent to the barred member, recorded in the
 * community's governance log, and written to the platform moderation audit
 * trail, which is what keeps the decision inside the appeal path's reach.
 */
export function CommunityRuleBanEditor({
  slug,
  ban,
  memberName,
  rules,
  onClose,
}: {
  slug: string;
  ban: CommunityBanDTO;
  memberName: string;
  rules: CommunityRuleOptionDTO[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updateBan = useUpdateCommunityBan(slug);
  const durationLegendId = useId();
  const reasonId = useId();

  const [durationValue, setDurationValue] = useState<string>(
    ban.expiresAt === null ? PERMANENT_VALUE : "7",
  );
  const [ruleIndex, setRuleIndex] = useState<number | null>(
    ban.rule?.index ?? null,
  );
  const [reason, setReason] = useState(ban.reason ?? "");

  const memberSlug = ban.member?.slug;
  // A bar with no end date is already permanent: it was signed, or it predates
  // the requirement. Re-proposing it would ask somebody to sign a decision
  // already made, and the server refuses it as "already permanent", so the
  // flag is simply not sent.
  const isAlreadyPermanent = ban.expiresAt === null;
  const isProposingPermanent =
    durationValue === PERMANENT_VALUE && !isAlreadyPermanent;

  const submit = () => {
    if (!memberSlug) return;
    const input: UpdateCommunityBanInput = {
      ...(durationValue === PERMANENT_VALUE
        ? isProposingPermanent
          ? { makePermanent: true }
          : {}
        : { banDays: Number(durationValue) }),
      ...(ruleIndex === null ? { clearRule: true } : { ruleIndex }),
      reason,
    };
    updateBan.mutate(
      { memberSlug, input },
      {
        onSuccess: (updated) => {
          // The bar is NOT permanent yet when a proposal was opened: the end
          // date is exactly where it was, and saying "updated" here would tell
          // the moderator they did the thing they only asked for.
          showToast(
            updated?.isPendingRatification
              ? t("communities:detail.modtools.ban.edit.proposedToast", {
                  name: memberName,
                })
              : t("communities:detail.modtools.ban.edit.savedToast", {
                  name: memberName,
                }),
            updated?.isPendingRatification ? "info" : "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            isNoSecondSignatoryError(error, isProposingPermanent)
              ? t("communities:detail.modtools.ban.edit.noSecondSignatoryToast")
              : t("communities:detail.modtools.ban.edit.errorToast"),
            "error",
          ),
      },
    );
  };

  return (
    <Modal
      title={t("communities:detail.modtools.ban.edit.title", {
        name: memberName,
      })}
      sub={t("communities:detail.modtools.ban.edit.sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={updateBan.isPending}
          >
            {t("communities:detail.modtools.ban.edit.cancel")}
          </Button>
          <Button onClick={submit} disabled={updateBan.isPending}>
            {t("communities:detail.modtools.ban.edit.saveCta")}
          </Button>
        </>
      }
    >
      <div className={styles.editorForm}>
        <div className={styles.editorGroup}>
          <span className={styles.editorLegend} id={durationLegendId}>
            {t("communities:detail.modtools.ban.edit.durationLegend")}
          </span>
          <Select
            labelledBy={durationLegendId}
            value={durationValue}
            onChange={(next) => setDurationValue(next ?? PERMANENT_VALUE)}
            disabled={updateBan.isPending}
            options={[
              ...BAN_DAY_OPTIONS.map((days) => ({
                value: String(days),
                label: t("communities:detail.modtools.ban.edit.days", {
                  count: days,
                }),
              })),
              {
                value: PERMANENT_VALUE,
                label: t(
                  isAlreadyPermanent
                    ? "communities:detail.modtools.ban.edit.permanent"
                    : "communities:detail.modtools.ban.edit.permanentPropose",
                ),
              },
            ]}
          />
          <p className={styles.editorHint}>
            {t("communities:detail.modtools.ban.edit.durationHint")}
          </p>
          {/* Picking Permanent no longer makes anything permanent (PRD-25).
              It asks a second owner, co-owner or moderator to sign, and the
              end date stays where it is until one of them does. Saying so
              here, before the click, rather than only in the toast after it. */}
          {isProposingPermanent && (
            <p className={styles.editorHint}>
              {t("communities:detail.modtools.ban.edit.permanentHint")}
            </p>
          )}
        </div>

        <CommunityRulePicker
          rules={rules}
          value={ruleIndex}
          onChange={setRuleIndex}
          disabled={updateBan.isPending}
        />

        <div className={styles.editorGroup}>
          <label className={styles.editorLegend} htmlFor={reasonId}>
            {t("communities:detail.modtools.ban.edit.reasonLegend")}
          </label>
          <textarea
            id={reasonId}
            className={styles.editorTextarea}
            value={reason}
            maxLength={500}
            disabled={updateBan.isPending}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t(
              "communities:detail.modtools.ban.edit.reasonPlaceholder",
            )}
          />
          <p className={styles.editorHint}>
            {t("communities:detail.modtools.ban.edit.reasonHint")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
