"use client";

import Tiptap from "@/components/custom/TipTapEditor";

export default function TestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="rounded-lg border bg-card text-card-foreground shadow">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">TipTap Editor Test</h2>
          <Tiptap className="min-h-[300px]" />
        </div>
      </div>
    </div>
  );
}
