"use client";
import { SignOutButton, SignedIn, useUser } from "@clerk/nextjs";

type Props = {};

function DashboardSideBar({}: Props) {
  const { user, isLoaded } = useUser();
  console.log(user);
  if (!isLoaded)
    return (
      <div className="h-screen w-full justify-center items-center">
        Loading....
      </div>
    );
  return (
    <nav className="border ">
      Welcome {user?.fullName}
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </nav>
  );
}

export default DashboardSideBar;
