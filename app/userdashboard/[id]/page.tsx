"use client";
import React, { useEffect } from "react";
// import { Editor } from "novel";
import "@blocksuite/presets/themes/affine.css";
import "@/styles/text-editor.css";
import "@blocknote/react/style.css";
import Room from "@/app/room/Room";
import { Editor } from "@/components/Editor";
import { redirect, useParams } from "next/navigation";

import { validateRequest } from "@/lib/lucia/auth";

type Props = {};

function UserDashboard({}: Props) {
  const roomId = useParams();

  // const { user } = await validateRequest();
  // if (!user) {
  //   return redirect("/login");
  // }

  return (
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden">
      <Room Editor={<Editor />} roomId={roomId.id as string} />
    </div>
  );
}

export default UserDashboard;
