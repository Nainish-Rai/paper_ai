"use client";

import { useState } from "react";
import { useDocumentStore } from "@/lib/stores/documentStore";
import { TipTapEditor } from "@/components/custom/TipTapEditor";
import { Card } from "@/components/ui/card";

export default function TestPage() {
  // For testing purposes, we'll use a dummy document
  const initialContent = "<p>This is a test document.</p>";
  const dummyDocumentId = "test-doc-1";

  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <TipTapEditor
          documentId={dummyDocumentId}
          initialContent={initialContent}
          className="min-h-[500px]"
        />
      </Card>
    </div>
  );
}
