import React, { useEffect } from "react";
import { Editor } from "novel";
import "@blocksuite/presets/themes/affine.css";

import { createEmptyPage, DocEditor } from "@blocksuite/presets";
import { Text } from "@blocksuite/store";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/lucia/auth";

type Props = {};

async function UserDashboard({}: Props) {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }
  console.log(user);

  return (
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden  py-16 flex justify-center">
      <Editor
        defaultValue={user.username}
        className="  w-full max-w-6xl h-fit rounded-xl shadow-lg border"
        completionApi="/api/generate"
      />
      {/* <div
        className=" w-full max-w-6xl py-20 min-h-96 h-fit rounded-xl shadow-lg border"
        id="editor"
      ></div> */}
    </div>
  );
}

export default UserDashboard;
