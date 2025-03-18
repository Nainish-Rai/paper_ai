import { RoomProvider } from "@/lib/contexts/RoomContext";
import { Toaster } from "@/components/ui/toaster";
import DashboardSideBar from "@/components/DashboardSideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoomProvider roomId={null}>
      <div className="flex">
        {children}
        <Toaster />
      </div>
    </RoomProvider>
  );
}
