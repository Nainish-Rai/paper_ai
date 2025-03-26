"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

type EditorContextType = {
  doc: Y.Doc;
  provider: YPartyKitProvider;
  documentId: string;
};

const EditorContext = createContext<EditorContextType | null>(null);

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
}

type EditorProviderProps = {
  children: ReactNode;
  documentId: string;
};

export function EditorProvider({ children, documentId }: EditorProviderProps) {
  const { doc, provider } = useMemo(() => {
    // Create a new Yjs document
    const doc = new Y.Doc();

    // Set up PartyKit provider
    const provider = new YPartyKitProvider(
      "blocknote-dev.yousefed.partykit.dev",
      // Use document ID as the room name for collaboration
      `paper-ai-${documentId}`,
      doc
    );

    return { doc, provider };
  }, [documentId]);

  const value = useMemo(
    () => ({
      doc,
      provider,
      documentId,
    }),
    [doc, provider, documentId]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}
