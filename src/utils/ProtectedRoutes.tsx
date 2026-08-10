import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import type { ProtectedRoutesProps } from "../types";

const ProtectedRoutes = ({
  children,
  requireRole,
}: ProtectedRoutesProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!requireRole.includes(user.role)) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate, requireRole]);

  if (!user) {
    return null;
  }

  if (!requireRole.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoutes;