import { useMemo, useState } from "react";
import {
  Button,
  FormField,
  MemberSelectList,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionsList } from "../connect/api/useConnectionsList";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { useSharePlans } from "./api/useSharePlans";
import { buildSharePlansMessage } from "./sharePlans";
import type { GatheringDetail } from "./data";
import styles from "./GatheringModals.module.css";

/**
 * "Tell someone where I'm going" (LOC-08).
 *
 * One connection, one message, sent through the DM path the member already
 * uses. It carries the gathering's name, when it starts, the most precise
 * place the sender actually holds (the street address once they have RSVP'd,
 * the venue and neighbourhood before that) and the link.
 *
 * The text is shown in full before it is sent, and it is editable. Somebody
 * telling a friend where they will be at nine tonight should be the one who
 * decides exactly what that message says.
 */
export function SharePlansModal({
  gathering,
  onClose,
}: {
  gathering: GatheringDetail;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const sharePlans = useSharePlans();
  const { views, loading } = useConnectionsList("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [body, setBody] = useState(() =>
    buildSharePlansMessage(gathering, t, fmt),
  );
  const [sent, setSent] = useState(false);

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      views.map((connection) => ({
        slug: connection.slug,
        name: connection.name,
        avatarUrl: connection.photo,
        pronouns: connection.pron,
      })),
    [views],
  );

  const recipientSlug = [...selected][0];
  const canSend =
    Boolean(recipientSlug) && body.trim().length > 0 && !sharePlans.isPending;

  const send = () => {
    if (!recipientSlug || !canSend) return;
    sharePlans.mutate(
      { recipientSlug, body: body.trim() },
      {
        onSuccess: () => setSent(true),
        onError: () =>
          showToast(t("gatherings:sharePlans.errorToast"), "error"),
      },
    );
  };

  if (sent) {
    const recipient = views.find(
      (connection) => connection.slug === recipientSlug,
    );
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:sharePlans.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={t("gatherings:sharePlans.successSub", {
          name: recipient?.name ?? "",
        })}
        meta={t("gatherings:sharePlans.successMeta")}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:sharePlans.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:sharePlans.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:sharePlans.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={send} disabled={!canSend}>
            {sharePlans.isPending
              ? t("gatherings:sharePlans.sendingCta")
              : t("gatherings:sharePlans.sendCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <MemberSelectList
        people={people}
        selected={selected}
        multiSelect={false}
        onToggle={(slug) =>
          setSelected((previous) =>
            previous.has(slug) ? new Set() : new Set([slug]),
          )
        }
        searchPlaceholder={t("gatherings:sharePlans.searchLabel")}
        emptyHint={
          loading
            ? t("gatherings:sharePlans.loadingConnections")
            : t("gatherings:sharePlans.noConnections")
        }
      />
      <div className={styles.fields}>
        <FormField
          label={t("gatherings:sharePlans.messageLabel")}
          helper={t("gatherings:sharePlans.messageHint")}
        >
          <textarea
            value={body}
            rows={6}
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
