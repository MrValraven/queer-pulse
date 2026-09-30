import type { ReactNode } from "react";
import {
  SubprofileEditorContext,
  type SubprofileEditorContextValue,
} from "../subprofileEditorContext";
import type { EditorStubFields } from "./feedImportTestData";

/** Provides a stand-in editor context to the feed components under test. */
export function WithEditor({
  editor,
  children,
}: {
  editor: EditorStubFields;
  children: ReactNode;
}) {
  // Only the fields above are read by the components under test.
  const value = editor as unknown as SubprofileEditorContextValue;
  return (
    <SubprofileEditorContext.Provider value={value}>
      {children}
    </SubprofileEditorContext.Provider>
  );
}
