import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

type NavItem = {
  label: string;
  path: string;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", roles: ["Admin", "Officer", "User"] },
  { label: "Officers", path: "/dashboard/officers", roles: ["Admin"] },
  { label: "Incidents", path: "/dashboard/incidents", roles: ["Admin", "Officer"] },
  { label: "Births", path: "/dashboard/births", roles: ["Admin", "Officer"] },
  { label: "Deaths", path: "/dashboard/deaths", roles: ["Admin", "Officer"] },
  { label: "Marriages", path: "/dashboard/marriages", roles: ["Admin", "Officer"] },
  { label: "Device Approvals", path: "/dashboard/devices", roles: ["Admin", "Officer"] },
];

const Sidebar = () => {
  const userRole = useAppSelector((state) => state.auth.user?.role?.name);
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
                `block px-4 py-2 rounded ${isActive ? "bg-green-700" : "hover:bg-green-800"
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
