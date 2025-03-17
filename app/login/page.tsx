import LoginCard from "@/components/custom/LoginCard";
import { redirect } from "next/navigation";

export default async function Page() {
  return (
    <main className="w-full h-screen flex  items-center">
      <div className="w-1/3">
        <video
          autoPlay
          muted
          loop
          id="myVideo"
          playsInline
          className="h-screen  object-cover"
          src="/video.mp4"
        />
      </div>
      <div className="w-2/3  p-8 px-16 ">
        <LoginCard />
        <p className="p text-xs w-1/2 text-center">
          By creating an account you agree with our Terms of Service, Privacy
          Policy, and our default Notification Settings.
        </p>
      </div>
    </main>
  );
}
