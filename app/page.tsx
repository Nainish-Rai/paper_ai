import Room from "./room/page";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      Hello World
      <Room>
        <Editor />
      </Room>
    </main>
  );
}
