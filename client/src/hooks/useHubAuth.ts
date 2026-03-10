import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export function useHubAuth() {
  const { data: user, isLoading, refetch } = trpc.hub.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = trpc.hub.logout.useMutation({
    onSuccess: () => refetch(),
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
    refetch,
  };
}
