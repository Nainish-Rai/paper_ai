import { Button } from "@/components/ui/button";
import { Mail, SendHorizonal } from "lucide-react";
import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Start Collaborating Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience real-time collaborative document editing with AI
            assistance. Create your free account and start working with your
            team instantly.
          </p>

          <div className="mx-auto mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:mt-12">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/features">See All Features</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required • Free plan available • Instant access
          </p>
        </div>
      </div>
    </section>
  );
}
