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
  { label: "ID Registration", path: "dashboard/id-registration", roles: ["Admin", "Officer"]},
  { label: "Device Approvals", path: "/dashboard/devices", roles: ["Admin", "Officer"] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const userRole = useAppSelector((state) => state.auth.user?.role?.name);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 p-4 text-white bg-green-900 flex-col">
        <h2 className="mb-6 text-xl font-bold">NGAO MIS</h2>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {NAV_ITEMS
            .filter(item => userRole && item.roles.includes(userRole))
            .map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded transition-colors ${
                    isActive ? "bg-green-700" : "hover:bg-green-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 p-4 text-white bg-green-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">NGAO MIS</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-800 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto">
          {NAV_ITEMS
            .filter(item => userRole && item.roles.includes(userRole))
            .map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded transition-colors ${
                    isActive ? "bg-green-700" : "hover:bg-green-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
