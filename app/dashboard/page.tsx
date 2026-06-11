import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <Suspense fallback={<Skeleton className="h-[200px]" />}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
