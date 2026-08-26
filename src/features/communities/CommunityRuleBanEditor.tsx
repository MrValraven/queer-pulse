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
import { CommunityRulePicker } from "./CommunityRulePicker";
import styles from "./CommunityRuleCitation.module.css";

/** The sentinel a `Select` uses for "this ban does not end by itself". */
const PERMANENT_VALUE = "permanent";

/** Lengths a moderator can put on a bar, in days. */
const BAN_DAY_OPTIONS = [1, 3, 7, 14, 30, 90, 180, 365] as const;

/**
 * Revise a ban that is already in place: give it an end date, make it
 * permanent again, rewrite what the member was told, or cite the house rule it
 * rests on.
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

  const submit = () => {
    if (!memberSlug) return;
    const input: UpdateCommunityBanInput = {
      ...(durationValue === PERMANENT_VALUE
        ? { makePermanent: true }
        : { banDays: Number(durationValue) }),
      ...(ruleIndex === null ? { clearRule: true } : { ruleIndex }),
      reason,
    };
    updateBan.mutate(
      { memberSlug, input },
      {
        onSuccess: () => {
          showToast(
            t("communities:detail.modtools.ban.edit.savedToast", {
              name: memberName,
            }),
            "success",
          );
          onClose();
        },
        onError: () =>
          showToast(
            t("communities:detail.modtools.ban.edit.errorToast"),
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
                label: t("communities:detail.modtools.ban.edit.permanent"),
              },
            ]}
          />
          <p className={styles.editorHint}>
            {t("communities:detail.modtools.ban.edit.durationHint")}
          </p>
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
