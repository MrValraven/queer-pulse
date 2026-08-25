import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { memberRefToPerson } from "../../shared/api/refs";
import { AdminChip, AdminAvatar, type AdminTone, type AvatarTone } from "./ui";
import { useResolveEditSuggestion } from "./api/useResolveEditSuggestion";
import type {
  EditSuggestionDTO,
  EditSuggestionField,
  EditSuggestionStatus,
} from "./api/editSuggestions.api";
import styles from "./EditSuggestions.module.css";

const STATUS_TONE: Record<EditSuggestionStatus, AdminTone> = {
  pending: "amber",
  accepted: "jade",
  dismissed: "ghost",
};

const FIELD_TONE: Record<EditSuggestionField, AdminTone> = {
  hours: "plum",
  address: "plum",
  phone: "plum",
  website: "plum",
  description: "plum",
  other: "ghost",
};

export function EditSuggestionRows({
  suggestions,
  onResolved,
}: {
  suggestions: EditSuggestionDTO[];
  onResolved: (id: string, status: EditSuggestionStatus) => void;
}) {
  const { t } = useTranslation();
  if (suggestions.length === 0) {
    return (
      <p className={styles.emptyLine}>{t("admin:editSuggestions.empty")}</p>
    );
  }
  return (
    <ul className={styles.rows}>
      {suggestions.map((suggestion, index) => (
        <FadeIn key={suggestion.id} delay={Math.min(index, 8) * 50} as="li">
          <EditSuggestionRow suggestion={suggestion} onResolved={onResolved} />
        </FadeIn>
      ))}
    </ul>
  );
}

function EditSuggestionRow({
  suggestion,
  onResolved,
}: {
  suggestion: EditSuggestionDTO;
  onResolved: (id: string, status: EditSuggestionStatus) => void;
}) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const resolve = useResolveEditSuggestion();
  const submitter = memberRefToPerson(suggestion.submittedBy);

  function decide(status: "accepted" | "dismissed") {
    resolve.mutate(
      { suggestion, status },
      {
        onSuccess: () => {
          onResolved(suggestion.id, status);
          showToast(
            t(`admin:editSuggestions.toast.${status}`, {
              name: suggestion.listingName,
            }),
            "success",
          );
        },
      },
    );
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{suggestion.listingName}</span>
          <AdminChip tone={FIELD_TONE[suggestion.field]}>
            {t(`admin:editSuggestions.field.${suggestion.field}`)}
          </AdminChip>
          <AdminChip tone={STATUS_TONE[suggestion.status]} dot>
            {t(`admin:editSuggestions.status.${suggestion.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {suggestion.listingRef} · {formatDate(suggestion.createdAt, language)}
        </div>
        <p className={styles.rowMessage}>{suggestion.message}</p>
        <div className={styles.rowSubmitter}>
          <AdminAvatar
            initials={submitter?.initials ?? "?"}
            // `Person.tint` is `AvatarTint` (a different, wider palette type);
            // `tintForSlug` (its only source) only ever produces coral/plum/jade,
            // which is also a subset of AdminAvatar's `AvatarTone`.
            tone={(submitter?.tint as AvatarTone | undefined) ?? "anon"}
            size="sm"
            src={submitter?.avatarUrl ?? undefined}
          />
          <span>
            {t("admin:editSuggestions.submittedBy", {
              name:
                submitter?.name ?? t("admin:editSuggestions.unknownSubmitter"),
            })}
          </span>
        </div>
      </div>
      {suggestion.status === "pending" && (
        <div className={styles.rowActions}>
          <Button
            variant="jade"
            size="md"
            onClick={() => decide("accepted")}
            disabled={resolve.isPending}
          >
            {t("admin:editSuggestions.acceptCta")}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => decide("dismissed")}
            disabled={resolve.isPending}
          >
            {t("admin:editSuggestions.dismissCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
