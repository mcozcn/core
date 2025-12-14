import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // AuthGuard is permissive in public/open mode. Keep the hook available
  // so we don't break components that rely on the hook elsewhere.
  // If you later want to re-enable gating, restore previous behavior.
  void useAuth();
  return <>{children}</>;
};

export default AuthGuard;
