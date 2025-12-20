import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

type NavItem = {
  label: string;
  path: string;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["SUPER_ADMIN", "ADMIN", "OFFICER"] },
  { label: "Officers", path: "/dashboard/officers", roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Incidents", path: "/dashboard/incidents", roles: ["SUPER_ADMIN", "ADMIN", "OFFICER"] },
  { label: "Births", path: "/dashboard/births", roles: ["ADMIN"] },
  { label: "Deaths", path: "/dashboard/deaths", roles: ["ADMIN"] },
  { label: "Marriages", path: "/dashboard/marriages", roles: ["ADMIN"] },
  { label: "Device Approvals", path: "/dashboard/devices", roles: ["SUPER_ADMIN"] },
];

const Sidebar = () => {
  const userRole = useAppSelector((state) => state.auth.user?.role);

  return (
    <aside className="w-64 h-screen p-4 text-white bg-green-900">
      <h2 className="mb-6 text-xl font-bold">NGAO MIS</h2>

      <nav className="space-y-2">
        {NAV_ITEMS
          .filter(item => userRole && item.roles.includes(userRole))
          .map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded ${
                  isActive ? "bg-green-700" : "hover:bg-green-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
