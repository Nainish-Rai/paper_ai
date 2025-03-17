import Room from "./room/Room";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Link href="/login">Login</Link>
      {/* <Room Editor={<Editor />} roomId="nextjs-yjs-blocknote-advanced" /> */}
    </main>
  );
}
