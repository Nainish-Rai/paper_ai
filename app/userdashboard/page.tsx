import { SignOutButton, SignedIn } from "@clerk/nextjs";
import React from "react";
// import editor as jsx element
import { Editor } from "novel";

type Props = {};

function UserDashboard({}: Props) {
  return (
    <div className="w-full  flex justify-center items-center">
      user Dashboard
      <SignedIn>
        <SignOutButton />
      </SignedIn>
      <Editor defaultValue={"Nainish"} completionApi="/api/generate" />
    </div>
  );
}

export default UserDashboard;
