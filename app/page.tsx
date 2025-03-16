import Room from "./room/Room";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Room Editor={<Editor />} roomId="nextjs-yjs-blocknote-advanced" />
    </main>
  );
}
