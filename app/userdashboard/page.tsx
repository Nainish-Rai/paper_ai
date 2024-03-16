import React, { useEffect } from "react";
// import { Editor } from "novel";
import "@blocksuite/presets/themes/affine.css";
import "@/styles/text-editor.css";
import "@blocknote/react/style.css";
import Room from "../room/page";
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
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden">
      <Room>
        <Editor />
      </Room>
    </div>
  );
}

export default UserDashboard;
