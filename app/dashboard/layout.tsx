import { RoomProvider } from "@/lib/contexts/RoomContext";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoomProvider roomId={null}>
      <div>
        {children}
        <Toaster />
      </div>
    </RoomProvider>
  );
}
