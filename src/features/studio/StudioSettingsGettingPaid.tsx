import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Collapse, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import type { StudioArtistRefView } from "./api/studio.adapters";
import type { StudioPaymentMethodsView } from "./api/studioPurchases.adapters";
import { useStudioPaymentMethods } from "./api/useStudioPaymentMethods";
import { StudioPaymentMethodsEditor } from "./StudioPaymentMethodsEditor";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioLine } from "./StudioSkeletons";
import { SettingsSection } from "./StudioSettingsOption";
import { STUDIO_GETTING_PAID_ANCHOR } from "./studioPaths";
import styles from "./StudioGettingPaid.module.css";

interface EditorView {
  persona: StudioArtistRefView;
  paymentMethods: StudioPaymentMethodsView;
}

/**
 * Getting paid, in Studio settings: the ways buyers pay one artist page. It
 * shows only to a member with an uploadable persona. The persona comes from
 * `?persona=` (the first when absent), with a select while there are several.
 * An address ending in `#getting-paid` puts focus on the section heading and
 * scrolls to it once the section has loaded.
 */
export function StudioSettingsGettingPaid() {
  const { t } = useTranslation();
  const { uploadablePersonas } = useStudioAccess();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const selectId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const personaParam = searchParams.get("persona");
  const persona =
    uploadablePersonas.find((candidate) => candidate.id === personaParam) ??
    uploadablePersonas[0] ??
    null;
  const { paymentMethods, loadState } = useStudioPaymentMethods(
    persona?.id ?? null,
  );
  // The last loaded editor view stays mounted while a persona switch loads,
  // so the Collapse folds it out and back in.
  const [lastView, setLastView] = useState<EditorView | null>(null);
  if (
    persona &&
    paymentMethods &&
    (lastView?.persona.id !== persona.id ||
      lastView.paymentMethods !== paymentMethods)
  )
    setLastView({ persona, paymentMethods });
  const editorView =
    persona && paymentMethods ? { persona, paymentMethods } : lastView;
  const hasPersona = persona !== null;
  const isAnchored = hash === `#${STUDIO_GETTING_PAID_ANCHOR}`;
  const hasSettled = paymentMethods !== null || loadState.isError;

  useEffect(() => {
    if (!isAnchored || !hasPersona) return;
    const heading = anchorRef.current?.querySelector("h2");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, [isAnchored, hasPersona]);

  // The scroll waits for the section's content and the next frame: on a
  // fresh load the page grows while it renders, and the route's own scroll
  // runs before this section exists, so an early scroll lands short.
  useEffect(() => {
    if (!isAnchored || !hasPersona || !hasSettled) return;
    const frame = requestAnimationFrame(() => {
      anchorRef.current
        ?.querySelector("h2")
        ?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [isAnchored, hasPersona, hasSettled]);

  if (!persona) return null;
  const isFailed = loadState.isError && !loadState.isNotFound;
  const isLoading = !paymentMethods && !loadState.isError;
  return (
    <div
      id={STUDIO_GETTING_PAID_ANCHOR}
      ref={anchorRef}
      className={styles.anchor}
    >
      <SettingsSection
        labelKey="studio:paymentMethods.label"
        titleKey="studio:paymentMethods.title"
      >
        <p className={styles.note}>{t("studio:paymentMethods.dek")}</p>
        <Collapse isOpen={uploadablePersonas.length > 1}>
          <div className={styles.personaField}>
            <label htmlFor={selectId}>
              {t("studio:paymentMethods.personaLabel")}
            </label>
            <Select
              id={selectId}
              className={styles.select}
              label={t("studio:paymentMethods.personaLabel")}
              size="sm"
              searchable={false}
              value={persona.id}
              options={uploadablePersonas.map((candidate) => ({
                value: candidate.id,
                label: candidate.name,
              }))}
              onChange={(subprofileId) => {
                if (!subprofileId) return;
                setSearchParams(
                  (previous) => {
                    const next = new URLSearchParams(previous);
                    next.set("persona", subprofileId);
                    return next;
                  },
                  { replace: true },
                );
              }}
            />
          </div>
        </Collapse>
        <p className={styles.privacy}>
          {t("studio:paymentMethods.privacyNote")}
        </p>
        <Collapse isOpen={loadState.isNotFound}>
          <p className={styles.note}>
            {t("studio:errors.reason.studio_persona_not_found")}
          </p>
        </Collapse>
        <Collapse isOpen={isFailed}>
          <StudioLoadError
            loadState={loadState}
            what="studio:errors.what.paymentMethods"
          />
        </Collapse>
        <Collapse isOpen={isLoading}>
          <div
            className={styles.skeleton}
            role="status"
            aria-label={t("studio:loading.detail")}
          >
            <StudioLine width="100%" height={150} />
            <StudioLine width="100%" height={150} />
          </div>
        </Collapse>
        <Collapse isOpen={paymentMethods !== null}>
          {editorView && (
            <StudioPaymentMethodsEditor
              key={editorView.persona.id}
              persona={editorView.persona}
              paymentMethods={editorView.paymentMethods}
            />
          )}
        </Collapse>
      </SettingsSection>
    </div>
  );
}
