import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      <div className="space-y-4">
        <Skeleton className="h-12 w-[200px]" />
        <Skeleton className="h-[120px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[180px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
