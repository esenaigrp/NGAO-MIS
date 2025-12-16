import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 p-4 text-white bg-green-900">
      <h2 className="mb-6 text-xl font-bold">NGAO MIS</h2>

      <nav className="space-y-3">
        <Link className="block px-3 py-2 rounded hover:bg-green-700" to="/dashboard">
          Dashboard
        </Link>
        <Link className="block px-3 py-2 rounded hover:bg-green-700" to="/incidents">
          Incidents
        </Link>
        <Link className="block px-3 py-2 rounded hover:bg-green-700" to="/users">
          Users
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;