import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { DashboardHeader } from "@/components/dashboard/header";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { RoomsList } from "@/components/dashboard/rooms-list";
import { DashboardActions } from "@/components/dashboard/actions";
import { UserWelcome } from "@/components/dashboard/user-welcome";

export const metadata = {
  title: "Dashboard | Paper AI",
  description: "Manage your documents and collaborations",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const { user } = session;

  return (
    <div className="container mx-auto px-4 pb-6">
      {/* <DashboardHeader user={user} /> */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-0">
        <div className="lg:col-span-2">
          <UserWelcome user={user} />
          <RecentDocuments />
        </div>
        <div>
          <DashboardActions />
        </div>
      </div>

      <div className="mt-10">
        <RoomsList userId={user.id} />
      </div>
    </div>
  );
}
