"use client";

import "@blocksuite/presets/themes/affine.css";
import "@/styles/text-editor.css";
import "@blocknote/react/style.css";
import { Room } from "@/app/Room";
import { Editor } from "@/components/Editor";
import { authClient } from "@/lib/auth/client";
import { redirect } from "next/navigation";

interface UserDashboardClientProps {
  id: string;
}

export default function UserDashboardClient({ id }: UserDashboardClientProps) {
  const { data: session, isPending } = authClient.useSession();

  if (!session && !isPending) {
    redirect("/login");
  }

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden">
      <Room roomId={id}>
        <Editor />
      </Room>
    </div>
  );
}
