"use client";

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

type EditorContextType = {
  doc: Y.Doc;
  provider: YPartyKitProvider;
  documentId: string;
  userId: string;
  isConnected: boolean;
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
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { doc, provider } = useMemo(() => {
    // Create a new Yjs document
    const doc = new Y.Doc();

    // Set up PartyKit provider
    const provider = new YPartyKitProvider(
      "blocknote-dev.yousefed.partykit.dev",
      // Use document ID as the room name for collaboration
      `paper-ai-${documentId}`,
      doc,
      {
        connect: true,
        // Add WebSocket connection options
        WebSocketPolyfill: WebSocket,
        maxBackoffTime: 5000,
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

  // Handle connection state
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      // Attempt to reconnect after a delay
      const timeout = setTimeout(() => {
        if (!provider.shouldConnect) {
          provider.connect();
        }
      }, 1000);
      reconnectTimeoutRef.current = timeout;
    };

    provider.on("sync", handleConnect);
    provider.on("disconnect", handleDisconnect);

    // Clean up
    return () => {
      provider.off("sync", handleConnect);
      provider.off("disconnect", handleDisconnect);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      provider.disconnect();
      doc.destroy();
    };
  }, [provider, doc]);

  const value = useMemo(
    () => ({
      doc,
      provider,
      documentId,
      userId,
      isConnected,
    }),
    [doc, provider, documentId, userId, isConnected]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}
