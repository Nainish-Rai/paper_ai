import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to dashboard if authenticated, otherwise to login
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // This code won't execute due to redirects above
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Paper AI - with Dark Mode
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-16 p-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Welcome to Paper AI
        </h1>
        <p className="text-gray-700 dark:text-gray-300">
          Your next-generation application with theme switching support. Click
          the sun/moon icon to toggle between light and dark modes.
        </p>
      </div>
    </main>
  );
}
