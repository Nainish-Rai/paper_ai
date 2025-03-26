import { Suspense } from "react";
import ProfileSettingsForm from "@/components/settings/profile-settings-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Settings - Paper AI",
  description: "Manage your account settings and preferences",
};

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Suspense fallback={<LoadingState />}>
        <ProfileSettingsForm />
      </Suspense>
    </div>
  );
}
