import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // O hook já redireciona
  }

  if (requiredRole && user?.role !== requiredRole) {
    navigate("/");
    return null;
  }

  return <>{children}</>;
}