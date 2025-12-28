import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error: reduxError, isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    try {
      const result = await dispatch(login({ email, password }));

      if (login.rejected.match(result)) {
        setLocalError(result.payload as string || "Login failed");
      }
    } catch {
      setLocalError("An unexpected error occurred. Please try again.");
    }
  };

  // Navigate after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-green-50">
      <div className="w-full max-w-md p-8 bg-white border-t-8 border-green-700 shadow-lg rounded-xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-green-800">NGAO MIS</h2>

        {/* Error container */}
        <div className="min-h-[2rem] mb-4">
          {(reduxError || localError) && (
            <div className="p-2 text-red-800 bg-red-100 rounded">
              {reduxError || localError}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-700"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white transition-colors bg-green-700 rounded-lg hover:bg-green-800 disabled:bg-green-300 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-500">
          &copy; {new Date().getFullYear()} Government of Kenya
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
