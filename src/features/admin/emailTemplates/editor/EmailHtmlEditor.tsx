import { lazy, Suspense } from "react";
import { SkeletonLine } from "../../../../shared/components/ui";
import type { FocusFieldHandler } from "./activeField";
import styles from "./emailTemplateEditor.module.css";

const EmailHtmlCodeMirror = lazy(() => import("./EmailHtmlCodeMirror"));

interface EmailHtmlEditorProps {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  onFocusField?: FocusFieldHandler;
}

export function EmailHtmlEditor({
  id,
  label,
  value,
  onChange,
  isReadOnly,
  onFocusField,
}: EmailHtmlEditorProps) {
  return (
    <div className={styles.htmlField}>
      <span id={`${id}-label`} className={styles.fieldLabel}>
        {label}
      </span>
      <Suspense fallback={<SkeletonLine height={240} />}>
        <EmailHtmlCodeMirror
          value={value}
          ariaLabel={label}
          onChange={onChange}
          isReadOnly={isReadOnly}
          onFocusField={onFocusField}
        />
      </Suspense>
    </div>
  );
}
