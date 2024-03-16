import Logout from "@/app/logout/page";

type Props = {};

function DashboardSideBar({}: Props) {
  return (
    <nav className="bg-secondary w-64 shadow-xl  ">
      Welcome
      <Logout />
    </nav>
  );
}

export default DashboardSideBar;
