import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  EmptyState,
  FormField,
  Modal,
  Select,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  ArticleLifecycleRecordDTO,
  CreateArticleTranslationDto,
} from "../../api/lifecycle.api";
import { useArticleTranslations } from "../../api/useLifecycleDesk";
import { useMagazineWriters } from "../../api/useMagazineWriters";
import type { ContentLocale } from "../../api/magazine.api";
import { CONTENT_LOCALE_LABEL } from "./lifecycleLabels";
import styles from "./LifecycleBoard.module.css";

export interface LifecycleTranslationsModalProps {
  record: ArticleLifecycleRecordDTO;
  isSaving: boolean;
  onClose: () => void;
  onOpenTranslation: (dto: CreateArticleTranslationDto) => void;
}

const LOCALES: ContentLocale[] = ["en", "pt"];

/**
 * CON-16 — every language a piece exists in, and the way to open another.
 *
 * Its own modal rather than a section of the lifecycle one, because they are
 * different decisions: that one says what a published piece IS now, this one
 * commissions new work. Opening a translation creates a real desk record with
 * its own stage and its own publish date, seeded with the original's blocks so
 * the translator works over the piece's structure. It ships when the
 * translator is done, which is rarely the day the original ships.
 *
 * The translator is picked from the same roster the desk commissions writers
 * from (PRD-440), so the new piece lands on them and they hear about the job.
 * Both are optional: an editor can open the work before deciding who will do
 * it. The credit line defaults to the picked member's name, and the free-text
 * field overrides how it reads (a pen name, a co-translator).
 */
export function LifecycleTranslationsModal({
  record,
  isSaving,
  onClose,
  onOpenTranslation,
}: LifecycleTranslationsModalProps) {
  const { t } = useTranslation();
  const { data: family, isLoading } = useArticleTranslations(record.pieceId);
  const [locale, setLocale] = useState<ContentLocale | null>(null);
  const [translatorUserId, setTranslatorUserId] = useState("");
  const [translatorByline, setTranslatorByline] = useState("");
  const writerList = useMagazineWriters();
  const { writers } = writerList;
  // Mirrors the commission modal: an empty roster while loading or after a
  // failure disables the picker, which says why.
  const isWriterListUnavailable =
    writers.length === 0 && (writerList.isLoading || writerList.isError);
  const pickedTranslator = writers.find(
    (writer) => writer.id === translatorUserId,
  );

  const existingLocales = new Set((family ?? []).map((row) => row.locale));
  const availableLocales = LOCALES.filter(
    (candidate) => !existingLocales.has(candidate),
  );

  return (
    <Modal
      title={record.title}
      eyebrow={t("magazine:lifecycle.languages.eyebrow")}
      sub={t("magazine:lifecycle.languages.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:lifecycle.modal.cancel")}
          </Button>
          <Button
            variant="primary"
            disabled={isSaving || locale === null}
            onClick={() => {
              if (!locale) return;
              onOpenTranslation({
                locale,
                translatorUserId: pickedTranslator?.id,
                translatorByline:
                  translatorByline.trim() || pickedTranslator?.name,
              });
            }}
          >
            {t("magazine:lifecycle.languages.open")}
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className={styles.loading}>
          <SkeletonLine width="60%" />
          <SkeletonLine width="45%" />
        </div>
      ) : (family?.length ?? 0) === 0 ? (
        <EmptyState
          compact
          title={t("magazine:lifecycle.languages.emptyTitle")}
          description={t("magazine:lifecycle.languages.emptyBody")}
        />
      ) : (
        <ul className={styles.list}>
          {(family ?? []).map((row) => (
            <li className={styles.row} key={row.articleId}>
              <span className={styles.stateChip}>
                {CONTENT_LOCALE_LABEL[row.locale]}
              </span>
              <div className={styles.rowMain}>
                <Link
                  className={styles.rowTitle}
                  to={`${routes.article}?id=${encodeURIComponent(row.slug)}`}
                >
                  {row.title}
                </Link>
                <span className={styles.rowMeta}>
                  {row.publishedAt
                    ? t("magazine:lifecycle.languages.published")
                    : t("magazine:lifecycle.languages.drafting")}
                  {row.translatorSlug &&
                    ` · ${t("magazine:lifecycle.languages.translator", {
                      name: row.translatorSlug,
                    })}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {availableLocales.length > 0 ? (
        <div className={styles.openForm}>
          <FormField label={t("magazine:lifecycle.languages.localeLabel")}>
            <Select
              value={locale}
              onChange={(value) => setLocale(value as ContentLocale | null)}
              placeholder={t("magazine:lifecycle.languages.localePlaceholder")}
              options={availableLocales.map((candidate) => ({
                value: candidate,
                label: CONTENT_LOCALE_LABEL[candidate],
              }))}
            />
          </FormField>
          <FormField
            label={t("magazine:lifecycle.languages.translatorLabel")}
            helper={
              isWriterListUnavailable
                ? t("magazine:lifecycle.languages.translatorsUnavailable")
                : t("magazine:lifecycle.languages.translatorHelper")
            }
          >
            <Select
              value={translatorUserId}
              disabled={isWriterListUnavailable}
              onChange={(value) => setTranslatorUserId(value ?? "")}
              options={[
                {
                  value: "",
                  label: t("magazine:lifecycle.languages.translatorNone"),
                },
                ...writers.map((writer) => ({
                  value: writer.id,
                  label: writer.name,
                })),
              ]}
            />
          </FormField>
          <FormField
            label={t("magazine:lifecycle.languages.bylineLabel")}
            helper={t("magazine:lifecycle.languages.bylineHelper")}
          >
            <input
              type="text"
              value={translatorByline}
              placeholder={pickedTranslator?.name}
              onChange={(event) => setTranslatorByline(event.target.value)}
            />
          </FormField>
        </div>
      ) : (
        <p className={styles.stateHint}>
          {t("magazine:lifecycle.languages.allDone")}
        </p>
      )}
    </Modal>
  );
}
