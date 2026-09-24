import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { html } from "@codemirror/lang-html";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import type { FocusFieldHandler } from "./activeField";
import styles from "./emailTemplateEditor.module.css";

export interface EmailHtmlCodeMirrorProps {
  value: string;
  ariaLabel: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  onFocusField?: FocusFieldHandler;
}

/**
 * CodeMirror 6 for email HTML. Default export so `EmailHtmlEditor` can
 * `lazy()` it: the editor and its language pack load only on this route.
 * Callbacks live in refs so the view is built once per read-only state and an
 * outside value change (e.g. "Edit as HTML") is dispatched into the live view.
 */
export default function EmailHtmlCodeMirror({
  value,
  ariaLabel,
  onChange,
  isReadOnly = false,
  onFocusField,
}: EmailHtmlCodeMirrorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const initialValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onFocusFieldRef = useRef(onFocusField);

  useEffect(() => {
    onChangeRef.current = onChange;
    onFocusFieldRef.current = onFocusField;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: viewRef.current?.state.doc.toString() ?? initialValueRef.current,
        extensions: [
          basicSetup,
          html(),
          EditorView.lineWrapping,
          EditorState.readOnly.of(isReadOnly),
          EditorView.editable.of(!isReadOnly),
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged)
              onChangeRef.current?.(update.state.doc.toString());
          }),
          EditorView.domEventHandlers({
            focus: (_event, focusedView) => {
              onFocusFieldRef.current?.({
                insert: (token) => {
                  const selection = focusedView.state.selection.main;
                  focusedView.dispatch({
                    changes: {
                      from: selection.from,
                      to: selection.to,
                      insert: token,
                    },
                    selection: { anchor: selection.from + token.length },
                  });
                  focusedView.focus();
                },
              });
              return false;
            },
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => view.destroy();
  }, [ariaLabel, isReadOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={hostRef} className={styles.codeHost} />;
}
