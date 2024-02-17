import React from "react";
import { Editor } from "novel";

type Props = {};

function UserDashboard({}: Props) {
  return (
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden  py-16 flex justify-center">
      <Editor
        defaultValue={"Nainish"}
        className="  w-full max-w-6xl h-fit rounded-xl shadow-lg border"
        completionApi="/api/generate"
      />
    </div>
  );
}

export default UserDashboard;
