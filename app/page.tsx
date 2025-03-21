import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import "../styles/text-editor.css";
import "@blocknote/react/style.css";
import HeroSection from "@/components/hero-section";
import Features from "@/components/features-1";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to dashboard if authenticated,
  if (session) {
    redirect("/dashboard");
  }
  return (
    <main className="h-full">
      <HeroSection />
      <Features />
      <CallToAction />
      <FooterSection />
    </main>
  );
}
