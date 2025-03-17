"use client";

import { type Editor } from "@tiptap/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";

interface TiptapProps {
  className?: string;
  content?: string;
}

const Tiptap = ({
  className,
  content = "<p>Hello World! 🌎️</p>",
}: TiptapProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base lg:prose-lg prose-stone dark:prose-invert focus:outline-none max-w-full",
          className
        ),
      },
    },
  });

  return <EditorContent editor={editor} className="w-full" />;
};

export default Tiptap;
