import Logout from "@/app/logout/page";

type Props = {};

function DashboardSideBar({}: Props) {
  return (
    <nav className="bg-secondary w-64 hidden lg:block border  ">
      <h1 className="h4 ">Dashboard</h1>
      <Logout />
    </nav>
  );
}

export default DashboardSideBar;
