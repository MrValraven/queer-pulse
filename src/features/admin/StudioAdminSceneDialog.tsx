import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Collapse, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useSaveAdminStudioScene,
  type SaveAdminStudioSceneVariables,
} from "./api/StudioAdminSceneHooks";
import type { AdminStudioSceneDTO } from "./api/studioDiscoveryAdmin.api";
import {
  StudioAdminSceneFields,
  type SceneFieldErrors,
  type SceneFieldValues,
} from "./StudioAdminSceneFields";
import {
  isValidSceneSlug,
  studioAdminSaveErrorKeyOf,
} from "./studioAdmin.model";
import css from "./StudioAdminScenes.module.css";

/** Name and city are required; an address, when typed, must fit the slug
 *  pattern. An empty address is fine: the server builds one on create and
 *  keeps the current one on edit. */
function sceneFieldErrorsOf(values: SceneFieldValues): SceneFieldErrors {
  const errors: SceneFieldErrors = {};
  if (!values.name.trim())
    errors.name = "admin:studioAdmin.sceneDialog.nameRequired";
  if (!values.city.trim())
    errors.city = "admin:studioAdmin.sceneDialog.cityRequired";
  const slug = values.slug.trim();
  if (slug && !isValidSceneSlug(slug))
    errors.slug = "admin:studioAdmin.sceneDialog.slugInvalid";
  return errors;
}

/** Create (scene null) or edit a scene: name, city, address, blurb and
 *  cover. An empty address stays off the wire: on create the server builds
 *  one from the name, on edit the scene keeps its own. */
export function StudioAdminSceneDialog({
  scene,
  onClose,
}: {
  scene: AdminStudioSceneDTO | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const save = useSaveAdminStudioScene();
  const [values, setValues] = useState<SceneFieldValues>({
    name: scene?.name ?? "",
    city: scene?.city ?? "",
    slug: scene?.slug ?? "",
    blurb: scene?.blurb ?? "",
  });
  /** Undefined keeps the saved cover; null removes it. */
  const [coverKey, setCoverKey] = useState<string | null | undefined>(
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<SceneFieldErrors>({});
  const [saveErrorKey, setSaveErrorKey] = useState<string | null>(null);

  function submit() {
    if (save.isPending) return;
    const nextErrors = sceneFieldErrorsOf(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const trimmedSlug = values.slug.trim();
    const shared = {
      name: values.name.trim(),
      city: values.city.trim(),
      blurb: values.blurb.trim() || null,
      ...(coverKey === undefined ? {} : { coverKey }),
      ...(trimmedSlug && trimmedSlug !== scene?.slug
        ? { slug: trimmedSlug }
        : {}),
    };
    const variables: SaveAdminStudioSceneVariables = scene
      ? { sceneId: scene.id, body: shared }
      : { sceneId: null, body: shared };
    setSaveErrorKey(null);
    save.mutate(variables, {
      onSuccess: (saved) => {
        showToast(
          scene
            ? t("admin:studioAdmin.toast.sceneSaved")
            : t("admin:studioAdmin.toast.sceneCreated", { name: saved.name }),
          "success",
        );
        onClose();
      },
      onError: (cause) => setSaveErrorKey(studioAdminSaveErrorKeyOf(cause)),
    });
  }

  return (
    <Modal
      title={
        scene
          ? t("admin:studioAdmin.sceneDialog.editTitle", { name: scene.name })
          : t("admin:studioAdmin.sceneDialog.createTitle")
      }
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            aria-disabled={save.isPending || undefined}
            aria-busy={save.isPending || undefined}
            onClick={submit}
          >
            {t(
              scene
                ? "admin:studioAdmin.sceneDialog.saveCta"
                : "admin:studioAdmin.sceneDialog.createCta",
            )}
          </Button>
        </>
      }
    >
      <form
        ref={formRef}
        className={css.dialogForm}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <StudioAdminSceneFields
          values={values}
          errors={errors}
          onChange={(field, value) =>
            setValues((previous) => ({ ...previous, [field]: value }))
          }
          coverValue={
            coverKey === undefined ? (scene?.coverUrl ?? "") : (coverKey ?? "")
          }
          onCoverChange={setCoverKey}
        />
        <Collapse isOpen={saveErrorKey !== null}>
          <p className={css.error} role="alert">
            {saveErrorKey ? t(saveErrorKey) : null}
          </p>
        </Collapse>
      </form>
    </Modal>
  );
}
