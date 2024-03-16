import DashboardSideBar from "@/components/DashboardSideBar";

// import { useEffect, useState } from "react";

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  // const [userData, setUserData] = useState({});
  // console.log(userData);

  // useEffect(() => {
  //   fetch("/api/user/getuserbyid", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ id: "123" }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setUserData(data));
  // }, []);

  return (
    <section className="flex h-screen">
      <DashboardSideBar />
      {children}
    </section>
  );
}
