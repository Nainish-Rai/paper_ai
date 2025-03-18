"use client";
import { Room } from "@/app/Room";
import { CollaborativeEditor } from "@/components/CollaborativeEditor";

export default function Home() {
  return (
    <main>
      <Room roomId="tests123">
        <CollaborativeEditor />
      </Room>
    </main>
  );
}
