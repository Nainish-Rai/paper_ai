import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Image from "next/image";
import Room from "./room/page";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      Hello World
      <SignedIn>
        <div>user is logged in</div>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <Room>
        <Editor />
      </Room>
    </main>
  );
}
