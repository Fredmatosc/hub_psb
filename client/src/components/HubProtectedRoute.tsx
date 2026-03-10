import { useHubAuth } from "@/hooks/useHubAuth";
import { Redirect } from "wouter";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function HubProtectedRoute({ children, requireAdmin = false }: Props) {
  const { isAuthenticated, isAdmin, isLoading } = useHubAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 bg-red-600 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
