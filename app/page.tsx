import Room from "./room/page";
import { Editor } from "@/components/Editor";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
import { validateRequest } from "@/lib/lucia/auth";
export default async function Home() {
  const { user } = await validateRequest();
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between ">
        <h1 className="heading1 text-xl font-bold">Welcome</h1>
        <Room>
          <Editor />
        </Room>
      </main>
    );
  }
  console.log(user);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between ">
      <h1 className="heading1 text-xl font-bold">
        Welcome back, {user.username}
      </h1>
      <Room>
        <Editor />
      </Room>
    </main>
  );
}
