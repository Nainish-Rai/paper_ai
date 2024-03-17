import Room from "./room/page";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
import { validateRequest } from "@/lib/lucia/auth";
import { redirect } from "next/navigation";
export default async function Home() {
  const { user } = await validateRequest();
  if (user) {
    redirect("/userdashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <h1 className="heading1 text-xl font-bold">Welcome back,</h1>
      <Room>
        <Editor />
      </Room>
    </main>
  );
}
