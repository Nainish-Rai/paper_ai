import { create } from "zustand";
import { Document } from "@prisma/client";

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  createDocument: (
    title: string,
    roomId?: string,
    shared?: boolean
  ) => Promise<Document | null>;
  updateDocument: (documentId: string, content: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  createDocument: async (
    title: string,
    roomId?: string,
    shared: boolean = false
  ) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, roomId, shared }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const document = await response.json();
      set((state) => ({
        documents: [...state.documents, document],
        currentDocument: document,
      }));
      return document;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create document",
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  updateDocument: async (documentId: string, content: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to update document");
      }

      const updatedDocument = await response.json();
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === documentId ? updatedDocument : doc
        ),
        currentDocument:
          state.currentDocument?.id === documentId
            ? updatedDocument
            : state.currentDocument,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update document",
      });
      throw error;
    }
  },
}));
