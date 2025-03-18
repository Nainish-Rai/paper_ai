import UserDashboardClient from "./userDashboard";

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserDashboardClient id={id} />;
}
