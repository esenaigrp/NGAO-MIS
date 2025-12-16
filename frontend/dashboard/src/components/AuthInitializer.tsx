import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/slices/authSlice";
import { RootState } from "../store";

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isInitialLoad, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isInitialLoad) dispatch(checkAuth());
  }, [dispatch, isInitialLoad]);

  if (loading && isInitialLoad) return <div>Validating session...</div>;
  return <>{children}</>;
}
