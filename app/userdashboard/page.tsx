import React, { useEffect } from "react";
// import { Editor } from "novel";
import "@blocksuite/presets/themes/affine.css";
import "@/styles/text-editor.css";
import "@blocknote/react/style.css";
import Room from "@/app/room/Room";
import { Editor } from "@/components/Editor";
import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/lucia/auth";

type Props = {};

async function UserDashboard({}: Props) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="w-full min-h-screen shadow-xl overflow-scroll overflow-x-hidden">
      <Room Editor={<Editor />} roomId="nextjs-yjs-blocknote-advanced" />
    </div>
  );
}

export default UserDashboard;
