"use client";
/* eslint-disable @next/next/no-img-element */
// import Logout from "@/app/logout/page";
import CreateRoom from "./custom/CreateRoom";
import RoomLists from "./custom/SideBarComponents/RoomLists";
import { BsReverseLayoutTextSidebarReverse } from "react-icons/bs";
import { useSession } from "@/lib/providers/SessionProvider";
import { Button } from "./ui/button";

type Props = {};

function DashboardSideBar({}: Props) {
  const { user } = useSession();
  return (
    <nav className=" w-64  hidden lg:block border  ">
      <div className=" w-full h-full px-4 pr-6 pb-4 flex flex-col justify-between">
        <div>
          {/* sidebarbtn */}
          <div className="w-full  p-3 my-3 flex items-center ">
            <BsReverseLayoutTextSidebarReverse className="h-5 w-5 opacity-80 cursor-pointer hover:opacity-50 duration-200 " />
          </div>
          {/* userinfo */}
          <div className="flex items-center gap-2 py-3 pb-6 cursor-default  px-2">
            {user && (
              <img
                src={user?.image!}
                alt="pfp"
                className="rounded-full aspect-square w-12"
              />
            )}
            <div>
              <h3 className="h4 text-base font-semibold">{user?.username}</h3>
              <p className="text-xs opacity-95 ">Paper Workspace</p>
            </div>
          </div>
          {/* create */}
          <CreateRoom userInfo={user!} />
          {/* notes */}
          {user && <RoomLists username={user.username} />}
          {/*  */}
        </div>
        {/* <Logout /> */}
        <Button
          className="w-full justify-self-end"
          onClick={() => {
            fetch("/api/auth/logout");
          }}
        >
          Sign out
        </Button>
      </div>
    </nav>
  );
}

export default DashboardSideBar;
