import Logout from "@/app/logout/page";
import CreateRoom from "./custom/CreateRoom";
import { validateRequest } from "@/lib/lucia/auth";
import RoomLists from "./custom/SideBarComponents/RoomLists";

type Props = {};

async function DashboardSideBar({}: Props) {
  const { user } = await validateRequest();
  return (
    <nav className="bg-secondary w-64 hidden lg:block border  ">
      <h1 className="h4 ">Dashboard </h1>
      <Logout />
      <CreateRoom userInfo={user!} />
      <RoomLists username={user!.username} />
    </nav>
  );
}

export default DashboardSideBar;
