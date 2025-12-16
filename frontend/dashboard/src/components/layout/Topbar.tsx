import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";

interface TopbarProps {
  userName: string;
}

export default function Topbar() {
  const dispatch = useDispatch();

  return (
    <header className="flex items-center justify-end px-6 bg-white shadow h-14">
      <button
        onClick={() => dispatch(logout())}
        className="font-semibold text-red-600"
      >
        Logout
      </button>
    </header>
  );
}
