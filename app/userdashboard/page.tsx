"use client";
import React, { useEffect } from "react";
import { Editor } from "novel";
import "@blocksuite/presets/themes/affine.css";

import { createEmptyPage, DocEditor } from "@blocksuite/presets";
import { Text } from "@blocksuite/store";

type Props = {};

function UserDashboard({}: Props) {
  // useEffect(() => {
  //   (async () => {
  //     // Init editor with default block tree
  //     const page = await createEmptyPage().init();
  //     const editor = new DocEditor();
  //     editor.page = page;
  //     const element = document.getElementById("editor");
  //     element!.appendChild(editor);

  //     // Update block node with some initial text content
  //     const paragraphs = page.getBlockByFlavour("affine:paragraph");
  //     const paragraph = paragraphs[0];
  //     page.updateBlock(paragraph, { text: new Text("Hello World!") });
  //   })();
  // }, []);
  return (
    <div className="w-full min-h-screen overflow-scroll overflow-x-hidden  py-16 flex justify-center">
      <Editor
        defaultValue={"Nainish"}
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
