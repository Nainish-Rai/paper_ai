"use client";

import { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

type EditorContextType = {
  doc: Y.Doc;
  provider: YPartyKitProvider;
  documentId: string;
  userId: string;
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
  userId: string;
};

export function EditorProvider({
  children,
  documentId,
  userId,
}: EditorProviderProps) {
  const { doc, provider } = useMemo(() => {
    // Create a new Yjs document
    const doc = new Y.Doc();

    // Set up PartyKit provider
    const provider = new YPartyKitProvider(
      getPartyKitHost(),
      // Use document ID as the room name for collaboration
      `paper-ai-${documentId}`,
      doc,
      {
        connect: true,
        party: "document",
      }
    );

    // Set user awareness state
    provider.awareness.setLocalState({
      userId,
      name: `User ${userId ? userId.slice(0, 4) : "Anonymous"}`,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    return { doc, provider };
  }, [documentId, userId]);

  useEffect(() => {
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [doc, provider]);

  const value = useMemo(
    () => ({
      doc,
      provider,
      documentId,
      userId,
    }),
    [doc, provider, documentId, userId]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

function getPartyKitHost() {
  const configuredHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST?.trim();

  if (configuredHost) {
    return configuredHost.replace(/^https?:\/\//, "");
  }

  return process.env.NODE_ENV === "development" ? "localhost:1999" : "";
}
