"use client";
import DashboardSideBar from "@/components/DashboardSideBar";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState({});
  console.log(userData);
  const { user, isLoaded } = useUser();
  useEffect(() => {
    fetch("/api/user/getuserbyid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: user?.id }),
    })
      .then((res) => res.json())
      .then((data) => setUserData(data));
  }, [user?.id]);

  if (!isLoaded)
    return (
      <div className="h-screen w-full justify-center items-center">
        Loading....
      </div>
    );

  return (
    <section className="flex h-screen">
      <DashboardSideBar />
      {children}
    </section>
  );
}
