import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AIPerformanceCard } from "@/components/dashboard/ai-performance-card";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Main Dashboard Content */}
      <Suspense fallback={<Skeleton className="h-[200px]" />}>
        <DashboardClient />
      </Suspense>

      {/* AI Performance Analytics */}
      {/* <div className="grid gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-12">
        <Suspense fallback={<Skeleton className="h-[400px] col-span-3" />}>
          <AIPerformanceCard
            endpoint="grammar"
            title="Grammar Check Performance"
            description="Response times and success rates for grammar checking"
          />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] col-span-3" />}>
          <AIPerformanceCard
            endpoint="style"
            title="Style Analysis Performance"
            description="Response times and success rates for style analysis"
          />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] col-span-3" />}>
          <AIPerformanceCard
            endpoint="template"
            title="Template Generation Performance"
            description="Response times and success rates for template generation"
          />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] col-span-3" />}>
          <AIPerformanceCard
            endpoint="completion"
            title="AI Completion Performance"
            description="Response times and success rates for AI completions"
          />
        </Suspense>
      </div> */}
    </div>
  );
}
